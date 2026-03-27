import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { z } from 'zod';
import { env, DATABASE_URL } from './env.js';
import { prisma } from './prisma.js';
import { hashPassword, verifyPassword } from './auth/password.js';
import { signAccessToken, signRefreshToken } from './auth/tokens.js';

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      accessTtlSeconds: number;
      refreshTtlSeconds: number;
    };
  }
}

const app = Fastify({ logger: true });

app.decorate('config', {
  accessTtlSeconds: env.ACCESS_TOKEN_TTL_SECONDS,
  refreshTtlSeconds: env.REFRESH_TOKEN_TTL_SECONDS
});

await app.register(cors, { origin: true, credentials: true });
await app.register(jwt, {
  secret: env.JWT_ACCESS_SECRET
});

// Accept empty JSON bodies ("") as undefined, for dev tooling/curl.
app.addContentTypeParser('application/json', { parseAs: 'string' }, function (_req, body, done) {
  if (body === '' || body == null) return done(null, undefined as any);
  try {
    done(null, JSON.parse(body));
  } catch (err: any) {
    done(err, undefined as any);
  }
});

app.get('/health', async () => ({ ok: true }));

app.get('/meta', async () => ({
  service: 'ilim-ordo-api',
  db: DATABASE_URL.replace(/:\/\/.*@/, '://***:***@')
}));

const registerBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).optional()
});

app.post('/auth/register', async (req, reply) => {
  const body = registerBody.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) return reply.code(409).send({ error: 'EMAIL_IN_USE' });

  const user = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash: hashPassword(body.password),
      fullName: body.fullName ?? null,
      globalRoles: { create: [{ role: 'READER' }] }
    },
    select: { id: true, email: true, fullName: true }
  });

  return reply.code(201).send(user);
});

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

app.post('/auth/login', async (req, reply) => {
  const body = loginBody.parse(req.body);
  // DEV MODE: вход без проверки пароля.
  // Если пользователя нет — создаём автоматически.
  const user =
    (await prisma.user.findUnique({ where: { email: body.email } })) ??
    (await prisma.user.create({
      data: {
        email: body.email,
        passwordHash: hashPassword(body.password || 'dev'),
        globalRoles: { create: [{ role: 'READER' }] }
      }
    }));

  const accessToken = await signAccessToken(app, user);
  const refreshToken = await signRefreshToken(app, user);
  return { accessToken, refreshToken };
});

async function requireAuth(req: any, reply: any) {
  try {
    await req.jwtVerify();
  } catch {
    return reply.code(401).send({ error: 'UNAUTHORIZED' });
  }
}

async function getAuthUserWithRoles(req: any) {
  const userId = req.user?.sub as string;
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      globalRoles: { select: { role: true } },
      journalRoles: { select: { journalId: true, role: true } }
    }
  });
}

function hasGlobalRole(me: any, roles: string[]) {
  const set = new Set((me?.globalRoles ?? []).map((r: any) => r.role));
  return roles.some((r) => set.has(r));
}

function hasJournalRole(me: any, journalId: string, roles: string[]) {
  const set = new Set(
    (me?.journalRoles ?? [])
      .filter((r: any) => r.journalId === journalId)
      .map((r: any) => r.role)
  );
  return roles.some((r) => set.has(r));
}

// Dev UX: не блокируем интерфейс ролями при локальной разработке.
const RBAC_RELAXED = process.env.NODE_ENV !== 'production';

function hasJournalRoleOrRelax(me: any, journalId: string, roles: string[]) {
  return RBAC_RELAXED || hasJournalRole(me, journalId, roles);
}

function hasAnyEditorialRoleOrRelax(me: any) {
  if (RBAC_RELAXED) return true;
  return (me?.journalRoles ?? []).some((r: any) =>
    [
      'JOURNAL_MANAGER',
      'EDITOR_IN_CHIEF',
      'SECTION_EDITOR',
      'TECHNICAL_EDITOR',
      'COPY_EDITOR',
      'LAYOUT_EDITOR'
    ].includes(r.role)
  );
}

async function requireSuperAdmin(req: any, reply: any) {
  if (RBAC_RELAXED) return;
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  if (!hasGlobalRole(me, ['SUPER_ADMIN'])) return reply.code(403).send({ error: 'FORBIDDEN' });
}

app.get('/me', { preHandler: requireAuth }, async (req: any) => {
  const userId = req.user?.sub as string;
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      emailVerified: true,
      createdAt: true,
      globalRoles: { select: { role: true } },
      journalRoles: { select: { journalId: true, role: true } }
    }
  });
});

// DEV helper: сделать текущего пользователя SUPER_ADMIN
app.post('/dev/become-super-admin', { preHandler: requireAuth }, async (req: any, reply) => {
  const userId = req.user?.sub as string;
  await prisma.userGlobalRole.upsert({
    where: { userId_role: { userId, role: 'SUPER_ADMIN' } },
    update: {},
    create: { userId, role: 'SUPER_ADMIN' }
  });
  return reply.code(200).send({ ok: true });
});

// DEV helper: создать демо-журнал и демо-пользователей по ролям
app.post('/dev/demo/bootstrap', async (_req: any, reply) => {
  // Не запускаем в production
  if (process.env.NODE_ENV === 'production') return reply.code(404).send({ error: 'NOT_FOUND' });

  const demo = {
    journal: { title: 'Demo Journal', subdomain: 'demo-j1', defaultLang: 'ru' },
    password: 'ChangeMe123!',
    users: {
      author: { email: 'author@demo.local', fullName: 'Демо Автор' },
      reviewer: { email: 'reviewer@demo.local', fullName: 'Демо Рецензент' },
      editor: { email: 'editor@demo.local', fullName: 'Демо Редактор' },
      admin: { email: 'admin@demo.local', fullName: 'Демо Администратор' },
    },
  } as const;

  const journal =
    (await prisma.journal.findUnique({ where: { subdomain: demo.journal.subdomain } })) ??
    (await prisma.journal.create({
      data: {
        title: demo.journal.title,
        subdomain: demo.journal.subdomain,
        defaultLang: demo.journal.defaultLang,
        description: 'Демо-журнал для тестирования пилота.',
        contactEmail: 'editor@demo.local',
        aimScope: 'Демо цель и охват журнала (RU).',
        guidelines: 'Демо правила для авторов (RU).',
        ethicalPolicy: 'Демо этическая политика (RU).',
      },
    }));

  async function upsertUser(email: string, fullName: string) {
    return await prisma.user.upsert({
      where: { email },
      update: { fullName },
      create: { email, fullName, passwordHash: hashPassword(demo.password), globalRoles: { create: [{ role: 'READER' }] } },
      select: { id: true, email: true },
    });
  }

  const author = await upsertUser(demo.users.author.email, demo.users.author.fullName);
  const reviewer = await upsertUser(demo.users.reviewer.email, demo.users.reviewer.fullName);
  const editor = await upsertUser(demo.users.editor.email, demo.users.editor.fullName);
  const admin = await upsertUser(demo.users.admin.email, demo.users.admin.fullName);

  // Journal roles
  const grants: Array<{ userId: string; role: any }> = [
    { userId: author.id, role: 'AUTHOR' },
    { userId: reviewer.id, role: 'REVIEWER' },
    { userId: editor.id, role: 'EDITOR_IN_CHIEF' },
    { userId: admin.id, role: 'JOURNAL_MANAGER' },
  ];
  for (const g of grants) {
    await prisma.userJournalRole.upsert({
      where: { userId_journalId_role: { userId: g.userId, journalId: journal.id, role: g.role } },
      update: {},
      create: { userId: g.userId, journalId: journal.id, role: g.role },
    });
  }

  // Global admin role
  await prisma.userGlobalRole.upsert({
    where: { userId_role: { userId: admin.id, role: 'SUPER_ADMIN' } },
    update: {},
    create: { userId: admin.id, role: 'SUPER_ADMIN' },
  });

  return reply.code(200).send({
    journal: { id: journal.id, title: journal.title, subdomain: journal.subdomain },
    password: demo.password,
    users: {
      author: demo.users.author.email,
      reviewer: demo.users.reviewer.email,
      editor: demo.users.editor.email,
      admin: demo.users.admin.email,
    },
  });
});

const grantGlobalRoleBody = z.object({
  userEmail: z.string().email(),
  role: z.enum(['SUPER_ADMIN', 'PLATFORM_ADMIN', 'PUBLISHER', 'READER'])
});

app.post('/admin/global-roles/grant', { preHandler: [requireAuth, requireSuperAdmin] as any }, async (req: any, reply) => {
  const body = grantGlobalRoleBody.parse(req.body);
  const user = await prisma.user.upsert({
    where: { email: body.userEmail },
    update: {},
    create: { email: body.userEmail, passwordHash: hashPassword('ChangeMe123!') },
    select: { id: true }
  });
  await prisma.userGlobalRole.upsert({
    where: { userId_role: { userId: user.id, role: body.role } },
    update: {},
    create: { userId: user.id, role: body.role }
  });
  return reply.code(200).send({ ok: true });
});

const grantJournalRoleBody = z.object({
  userEmail: z.string().email(),
  role: z.enum([
    'JOURNAL_MANAGER',
    'EDITOR_IN_CHIEF',
    'SECTION_EDITOR',
    'TECHNICAL_EDITOR',
    'COPY_EDITOR',
    'LAYOUT_EDITOR',
    'STATISTICAL_EDITOR',
    'REVIEWER',
    'AUTHOR'
  ])
});

app.post(
  '/admin/journals/:journalId/roles/grant',
  { preHandler: [requireAuth, requireSuperAdmin] as any },
  async (req: any, reply) => {
    const journalId = req.params.journalId as string;
    const body = grantJournalRoleBody.parse(req.body);
    const user = await prisma.user.upsert({
      where: { email: body.userEmail },
      update: {},
      create: { email: body.userEmail, passwordHash: hashPassword('ChangeMe123!') },
      select: { id: true }
    });
    await prisma.userJournalRole.upsert({
      where: { userId_journalId_role: { userId: user.id, journalId, role: body.role } },
      update: {},
      create: { userId: user.id, journalId, role: body.role }
    });
    return reply.code(200).send({ ok: true });
  }
);

app.get('/me/submissions', { preHandler: requireAuth }, async (req: any) => {
  const userId = req.user?.sub as string;
  return await prisma.submission.findMany({
    where: { authorId: userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      status: true,
      title: true,
      language: true,
      articleType: true,
      journal: { select: { id: true, title: true, subdomain: true } }
    }
  });
});

app.get('/me/reviews', { preHandler: requireAuth }, async (req: any) => {
  const userId = req.user?.sub as string;
  return await prisma.review.findMany({
    where: { reviewerId: userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      dueAt: true,
      submittedAt: true,
      decision: true,
      submission: {
        select: {
          id: true,
          title: true,
          status: true,
          journal: { select: { id: true, title: true, subdomain: true } }
        }
      }
    }
  });
});

const createJournalBody = z.object({
  title: z.string().min(1),
  subdomain: z.string().min(3).regex(/^[a-z0-9-]+$/),
  defaultLang: z.string().min(2).default('en'),
  description: z.string().max(4000).optional(),
  websiteUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(64).optional(),
  contactAddress: z.string().max(4000).optional(),
  aimScope: z.string().max(20000).optional(),
  guidelines: z.string().max(20000).optional(),
  ethicalPolicy: z.string().max(20000).optional(),
  publicationPolicy: z.string().max(20000).optional(),
  pricingPolicy: z.string().max(20000).optional(),
});

app.post('/journals', { preHandler: requireAuth }, async (req: any, reply) => {
  const body = createJournalBody.parse(req.body);
  const userId = req.user.sub as string;

  const journal = await prisma.journal.create({
    data: {
      title: body.title,
      subdomain: body.subdomain,
      defaultLang: body.defaultLang,
      description: body.description ?? null,
      websiteUrl: body.websiteUrl ?? null,
      contactEmail: body.contactEmail ?? null,
      contactPhone: body.contactPhone ?? null,
      contactAddress: body.contactAddress ?? null,
      aimScope: body.aimScope ?? null,
      guidelines: body.guidelines ?? null,
      ethicalPolicy: body.ethicalPolicy ?? null,
      publicationPolicy: body.publicationPolicy ?? null,
      pricingPolicy: body.pricingPolicy ?? null,
      journalRoles: { create: [{ userId, role: 'JOURNAL_MANAGER' }] }
    }
  });
  return reply.code(201).send(journal);
});

app.get('/journals', async () => {
  return await prisma.journal.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, subdomain: true, defaultLang: true, description: true, websiteUrl: true, createdAt: true }
  });
});

app.get('/journals/:id', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const id = req.params.id as string;
  const journal = await prisma.journal.findUnique({ where: { id } });
  if (!journal) return reply.code(404).send({ error: 'NOT_FOUND' });
  if (!hasJournalRoleOrRelax(me, id, ['JOURNAL_MANAGER', 'EDITOR_IN_CHIEF', 'SECTION_EDITOR', 'TECHNICAL_EDITOR'])) {
    return reply.code(403).send({ error: 'FORBIDDEN' });
  }
  return journal;
});

const updateJournalBody = createJournalBody
  .omit({ title: true, subdomain: true })
  .partial()
  .extend({
    title: z.string().min(1).optional(),
    subdomain: z.string().min(3).regex(/^[a-z0-9-]+$/).optional(),
  });

app.patch('/journals/:id', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const id = req.params.id as string;
  if (!hasJournalRoleOrRelax(me, id, ['JOURNAL_MANAGER', 'EDITOR_IN_CHIEF'])) {
    return reply.code(403).send({ error: 'FORBIDDEN' });
  }
  const body = updateJournalBody.parse(req.body);
  const updated = await prisma.journal.update({
    where: { id },
    data: {
      title: body.title ?? undefined,
      subdomain: body.subdomain ?? undefined,
      defaultLang: body.defaultLang ?? undefined,
      description: body.description === undefined ? undefined : body.description ?? null,
      websiteUrl: body.websiteUrl === undefined ? undefined : body.websiteUrl ?? null,
      contactEmail: body.contactEmail === undefined ? undefined : body.contactEmail ?? null,
      contactPhone: body.contactPhone === undefined ? undefined : body.contactPhone ?? null,
      contactAddress: body.contactAddress === undefined ? undefined : body.contactAddress ?? null,
      aimScope: body.aimScope === undefined ? undefined : body.aimScope ?? null,
      guidelines: body.guidelines === undefined ? undefined : body.guidelines ?? null,
      ethicalPolicy: body.ethicalPolicy === undefined ? undefined : body.ethicalPolicy ?? null,
      publicationPolicy: body.publicationPolicy === undefined ? undefined : body.publicationPolicy ?? null,
      pricingPolicy: body.pricingPolicy === undefined ? undefined : body.pricingPolicy ?? null,
    }
  });
  return reply.code(200).send(updated);
});

// Public journal endpoints (no auth) for /j/:subdomain
app.get('/public/journals/:subdomain', async (req: any, reply) => {
  const subdomain = String(req.params.subdomain || '').toLowerCase();
  const lang = String(req.query?.lang || '').toLowerCase();
  const journal = await prisma.journal.findUnique({
    where: { subdomain },
    select: {
      id: true,
      title: true,
      subdomain: true,
      defaultLang: true,
      description: true,
      websiteUrl: true,
      contactEmail: true,
      contactPhone: true,
      contactAddress: true,
      aimScope: true,
      guidelines: true,
      ethicalPolicy: true,
      publicationPolicy: true,
      pricingPolicy: true,
    }
  });
  if (!journal) return reply.code(404).send({ error: 'NOT_FOUND' });

  const pageWhere: any = { journalId: journal.id, published: true };
  if (lang === 'ru' || lang === 'ky' || lang === 'en') pageWhere.language = lang;
  const pages = await prisma.journalPage.findMany({
    where: pageWhere,
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      language: true,
      content: true,
      published: true,
      showInRightMenu: true,
      showInTopNav: true,
      sortOrder: true,
      updatedAt: true,
    }
  });

  const issues = await prisma.issue.findMany({
    where: { journalId: journal.id, status: 'Published' },
    orderBy: [{ year: 'desc' }, { volume: 'desc' }, { number: 'desc' }],
    select: { id: true, year: true, volume: true, number: true, title: true, publicationDate: true }
  });

  return { journal, pages, issues };
});

const createSubmissionBody = z.object({
  journalId: z.string().min(1),
  title: z.string().min(1),
  abstract: z.string().min(50),
  keywords: z.array(z.string().min(1)).min(3),
  language: z.string().min(2),
  articleType: z.string().min(1),
  references: z.string().optional()
});

app.post('/submissions', { preHandler: requireAuth }, async (req: any, reply) => {
  const body = createSubmissionBody.parse(req.body);
  const authorId = req.user.sub as string;
  const submission = await prisma.submission.create({
    data: {
      journalId: body.journalId,
      authorId,
      title: body.title,
      abstract: body.abstract,
      keywords: body.keywords,
      language: body.language,
      articleType: body.articleType,
      references: body.references ?? null
    }
  });
  return reply.code(201).send(submission);
});

app.get('/submissions', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  if (!hasAnyEditorialRoleOrRelax(me)) return reply.code(403).send({ error: 'FORBIDDEN' });

  return await prisma.submission.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      status: true,
      title: true,
      language: true,
      articleType: true,
      handlingEditorId: true,
      journal: { select: { id: true, title: true, subdomain: true } },
      author: { select: { id: true, email: true, fullName: true } },
      handlingEditor: { select: { id: true, email: true, fullName: true } }
    }
  });
});

const updateSubmissionStatusBody = z.object({
  status: z.enum([
    'NEW_SUBMISSION',
    'WITH_EDITOR',
    'UNDER_REVIEW',
    'REVISION_REQUESTED',
    'UNDER_REVISION',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN',
    'IN_PRODUCTION',
    'READY_FOR_ISSUE',
    'PUBLISHED'
  ])
});

app.patch('/submissions/:id/status', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const id = req.params.id as string;
  const body = updateSubmissionStatusBody.parse(req.body);
  const sub = await prisma.submission.findUnique({ where: { id }, select: { id: true, journalId: true } });
  if (!sub) return reply.code(404).send({ error: 'NOT_FOUND' });
  if (
    !hasJournalRoleOrRelax(me, sub.journalId, [
      'JOURNAL_MANAGER',
      'EDITOR_IN_CHIEF',
      'SECTION_EDITOR',
      'TECHNICAL_EDITOR',
      'COPY_EDITOR',
      'LAYOUT_EDITOR'
    ])
  ) {
    return reply.code(403).send({ error: 'FORBIDDEN' });
  }
  const updated = await prisma.submission.update({
    where: { id },
    data: { status: body.status }
  });
  return reply.code(200).send(updated);
});

app.post('/submissions/:id/assign-editor', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const id = req.params.id as string;
  const sub = await prisma.submission.findUnique({ where: { id }, select: { id: true, journalId: true } });
  if (!sub) return reply.code(404).send({ error: 'NOT_FOUND' });
  if (!hasJournalRoleOrRelax(me, sub.journalId, ['JOURNAL_MANAGER', 'EDITOR_IN_CHIEF', 'SECTION_EDITOR'])) {
    return reply.code(403).send({ error: 'FORBIDDEN' });
  }
  const updated = await prisma.submission.update({
    where: { id },
    data: { handlingEditorId: me.id, status: 'WITH_EDITOR' }
  });
  return reply.code(200).send(updated);
});

app.get('/submissions/:id', { preHandler: requireAuth }, async (req: any, reply) => {
  const id = req.params.id as string;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      journal: { select: { id: true, title: true, subdomain: true } },
      author: { select: { id: true, email: true, fullName: true } },
      reviews: true,
      publication: true
    }
  });
  if (!submission) return reply.code(404).send({ error: 'NOT_FOUND' });
  return submission;
});

const inviteReviewBody = z.object({
  submissionId: z.string().min(1),
  reviewerEmail: z.string().email(),
  dueAt: z.string().datetime().optional()
});

app.post('/reviews/invite', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const body = inviteReviewBody.parse(req.body);
  const sub = await prisma.submission.findUnique({ where: { id: body.submissionId }, select: { journalId: true } });
  if (!sub) return reply.code(404).send({ error: 'NOT_FOUND' });
  if (!hasJournalRoleOrRelax(me, sub.journalId, ['JOURNAL_MANAGER', 'EDITOR_IN_CHIEF', 'SECTION_EDITOR'])) {
    return reply.code(403).send({ error: 'FORBIDDEN' });
  }

  const reviewer = await prisma.user.upsert({
    where: { email: body.reviewerEmail },
    update: {},
    create: { email: body.reviewerEmail, passwordHash: hashPassword('ChangeMe123!') },
    select: { id: true }
  });

  await prisma.userJournalRole.upsert({
    where: { userId_journalId_role: { userId: reviewer.id, journalId: sub.journalId, role: 'REVIEWER' } },
    update: {},
    create: { userId: reviewer.id, journalId: sub.journalId, role: 'REVIEWER' }
  });

  const review = await prisma.review.create({
    data: {
      submissionId: body.submissionId,
      reviewerId: reviewer.id,
      dueAt: body.dueAt ? new Date(body.dueAt) : null
    }
  });

  return reply.code(201).send(review);
});

const submitReviewBody = z.object({
  decision: z.enum(['ACCEPT', 'MINOR_REVISION', 'MAJOR_REVISION', 'REJECT']),
  commentToEditor: z.string().optional(),
  commentToAuthor: z.string().optional()
});

app.post('/reviews/:id/submit', { preHandler: requireAuth }, async (req: any, reply) => {
  const userId = req.user?.sub as string;
  const id = req.params.id as string;
  const body = submitReviewBody.parse(req.body);
  const existing = await prisma.review.findUnique({ where: { id }, select: { reviewerId: true } });
  if (!existing) return reply.code(404).send({ error: 'NOT_FOUND' });
  if (existing.reviewerId !== userId) return reply.code(403).send({ error: 'FORBIDDEN' });

  const review = await prisma.review.update({
    where: { id },
    data: {
      decision: body.decision,
      commentToEditor: body.commentToEditor ?? null,
      commentToAuthor: body.commentToAuthor ?? null,
      submittedAt: new Date()
    }
  });

  return reply.code(200).send(review);
});

app.post('/publications/from-submission/:submissionId', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const submissionId = req.params.submissionId as string;
  const sub = await prisma.submission.findUnique({ where: { id: submissionId }, select: { journalId: true } });
  if (!sub) return reply.code(404).send({ error: 'NOT_FOUND' });
  if (!hasJournalRoleOrRelax(me, sub.journalId, ['JOURNAL_MANAGER', 'EDITOR_IN_CHIEF', 'TECHNICAL_EDITOR'])) {
    return reply.code(403).send({ error: 'FORBIDDEN' });
  }
  const nationalId = `NAT-${submissionId}`;

  const publication = await prisma.publication.create({
    data: {
      submissionId,
      nationalId
    }
  });

  return reply.code(201).send(publication);
});

// Issues API (persisted)
const issueCreateBody = z.object({
  year: z.number().int().min(1900).max(3000),
  volume: z.number().int().min(1).optional(),
  number: z.number().int().min(1).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
  publicationDate: z.string().datetime().optional(),
  status: z.string().optional()
});

app.get('/journals/:journalId/issues', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const journalId = req.params.journalId as string;
  if (!hasJournalRoleOrRelax(me, journalId, ['JOURNAL_MANAGER', 'EDITOR_IN_CHIEF', 'SECTION_EDITOR', 'TECHNICAL_EDITOR'])) {
    return reply.code(403).send({ error: 'FORBIDDEN' });
  }
  return await prisma.issue.findMany({
    where: { journalId },
    orderBy: [{ year: 'desc' }, { volume: 'desc' }, { number: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      year: true,
      volume: true,
      number: true,
      title: true,
      description: true,
      coverImageUrl: true,
      publicationDate: true,
      status: true
    }
  });
});

app.post('/journals/:journalId/issues', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const journalId = req.params.journalId as string;
  if (!hasJournalRoleOrRelax(me, journalId, ['JOURNAL_MANAGER', 'EDITOR_IN_CHIEF', 'TECHNICAL_EDITOR'])) {
    return reply.code(403).send({ error: 'FORBIDDEN' });
  }
  const body = issueCreateBody.parse(req.body);
  const issue = await prisma.issue.create({
    data: {
      journalId,
      year: body.year,
      volume: body.volume ?? null,
      number: body.number ?? null,
      title: body.title ?? null,
      description: body.description ?? null,
      coverImageUrl: body.coverImageUrl ?? null,
      publicationDate: body.publicationDate ? new Date(body.publicationDate) : null,
      status: body.status ?? 'Draft'
    }
  });
  return reply.code(201).send(issue);
});

app.patch('/journals/:journalId/issues/:id', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const journalId = req.params.journalId as string;
  const id = req.params.id as string;
  if (!hasJournalRoleOrRelax(me, journalId, ['JOURNAL_MANAGER', 'EDITOR_IN_CHIEF', 'TECHNICAL_EDITOR'])) {
    return reply.code(403).send({ error: 'FORBIDDEN' });
  }
  const body = issueCreateBody.partial().parse(req.body);
  const issue = await prisma.issue.update({
    where: { id },
    data: {
      year: body.year ?? undefined,
      volume: body.volume === undefined ? undefined : body.volume ?? null,
      number: body.number === undefined ? undefined : body.number ?? null,
      title: body.title === undefined ? undefined : body.title ?? null,
      description: body.description === undefined ? undefined : body.description ?? null,
      coverImageUrl: body.coverImageUrl === undefined ? undefined : body.coverImageUrl ?? null,
      publicationDate: body.publicationDate === undefined ? undefined : body.publicationDate ? new Date(body.publicationDate) : null,
      status: body.status ?? undefined
    }
  });
  return reply.code(200).send(issue);
});

app.delete('/journals/:journalId/issues/:id', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const journalId = req.params.journalId as string;
  const id = req.params.id as string;
  if (!hasJournalRoleOrRelax(me, journalId, ['JOURNAL_MANAGER', 'EDITOR_IN_CHIEF'])) {
    return reply.code(403).send({ error: 'FORBIDDEN' });
  }
  await prisma.issue.delete({ where: { id } });
  return reply.code(200).send({ ok: true });
});

// Journal Pages API (persisted)
const pageUpsertBody = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  type: z.string().optional(),
  language: z.string().min(2).optional(),
  content: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  published: z.boolean().optional(),
  showInRightMenu: z.boolean().optional(),
  showInTopNav: z.boolean().optional(),
  sortOrder: z.number().int().optional()
});

app.get('/journals/:journalId/pages', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const journalId = req.params.journalId as string;
  if (!hasJournalRoleOrRelax(me, journalId, ['JOURNAL_MANAGER', 'EDITOR_IN_CHIEF', 'TECHNICAL_EDITOR'])) {
    return reply.code(403).send({ error: 'FORBIDDEN' });
  }
  return await prisma.journalPage.findMany({
    where: { journalId },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      title: true,
      slug: true,
      type: true,
      language: true,
      published: true,
      showInRightMenu: true,
      showInTopNav: true,
      sortOrder: true
    }
  });
});

app.post('/journals/:journalId/pages', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const journalId = req.params.journalId as string;
  if (!hasJournalRoleOrRelax(me, journalId, ['JOURNAL_MANAGER', 'EDITOR_IN_CHIEF', 'TECHNICAL_EDITOR'])) {
    return reply.code(403).send({ error: 'FORBIDDEN' });
  }
  const body = pageUpsertBody.parse(req.body);
  const page = await prisma.journalPage.create({
    data: {
      journalId,
      title: body.title,
      slug: body.slug,
      type: body.type ?? 'custom',
      language: body.language ?? 'ru',
      content: body.content ?? '',
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
      published: body.published ?? false,
      showInRightMenu: body.showInRightMenu ?? false,
      showInTopNav: body.showInTopNav ?? false,
      sortOrder: body.sortOrder ?? 0
    }
  });
  return reply.code(201).send(page);
});

app.get('/journals/:journalId/pages/:id', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const journalId = req.params.journalId as string;
  const id = req.params.id as string;
  if (!hasJournalRoleOrRelax(me, journalId, ['JOURNAL_MANAGER', 'EDITOR_IN_CHIEF', 'TECHNICAL_EDITOR'])) {
    return reply.code(403).send({ error: 'FORBIDDEN' });
  }
  const page = await prisma.journalPage.findUnique({ where: { id } });
  if (!page || page.journalId !== journalId) return reply.code(404).send({ error: 'NOT_FOUND' });
  return page;
});

app.patch('/journals/:journalId/pages/:id', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const journalId = req.params.journalId as string;
  const id = req.params.id as string;
  if (!hasJournalRoleOrRelax(me, journalId, ['JOURNAL_MANAGER', 'EDITOR_IN_CHIEF', 'TECHNICAL_EDITOR'])) {
    return reply.code(403).send({ error: 'FORBIDDEN' });
  }
  const body = pageUpsertBody.partial().parse(req.body);
  const page = await prisma.journalPage.update({
    where: { id },
    data: {
      title: body.title ?? undefined,
      slug: body.slug ?? undefined,
      type: body.type ?? undefined,
      language: body.language ?? undefined,
      content: body.content ?? undefined,
      seoTitle: body.seoTitle === undefined ? undefined : body.seoTitle ?? null,
      seoDescription: body.seoDescription === undefined ? undefined : body.seoDescription ?? null,
      published: body.published ?? undefined,
      showInRightMenu: body.showInRightMenu ?? undefined,
      showInTopNav: body.showInTopNav ?? undefined,
      sortOrder: body.sortOrder ?? undefined
    }
  });
  if (page.journalId !== journalId) return reply.code(404).send({ error: 'NOT_FOUND' });
  return reply.code(200).send(page);
});

app.delete('/journals/:journalId/pages/:id', { preHandler: requireAuth }, async (req: any, reply) => {
  const me = await getAuthUserWithRoles(req);
  if (!me) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const journalId = req.params.journalId as string;
  const id = req.params.id as string;
  if (!hasJournalRoleOrRelax(me, journalId, ['JOURNAL_MANAGER', 'EDITOR_IN_CHIEF'])) {
    return reply.code(403).send({ error: 'FORBIDDEN' });
  }
  const page = await prisma.journalPage.findUnique({ where: { id } });
  if (!page || page.journalId !== journalId) return reply.code(404).send({ error: 'NOT_FOUND' });
  await prisma.journalPage.delete({ where: { id } });
  return reply.code(200).send({ ok: true });
});

await app.listen({ port: env.API_PORT, host: '0.0.0.0' });

