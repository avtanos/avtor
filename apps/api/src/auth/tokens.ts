import type { FastifyInstance } from 'fastify';

export type JwtUser = {
  sub: string;
  email: string;
};

export async function signAccessToken(app: FastifyInstance, user: { id: string; email: string }) {
  return await app.jwt.sign(
    { email: user.email },
    { sub: user.id, expiresIn: app.config.accessTtlSeconds }
  );
}

export async function signRefreshToken(app: FastifyInstance, user: { id: string; email: string }) {
  return await app.jwt.sign(
    { email: user.email, typ: 'refresh' },
    { sub: user.id, expiresIn: app.config.refreshTtlSeconds }
  );
}

