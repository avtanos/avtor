# avtor

Платформа управления научными журналами **Ilim Ordo** — стартовый **MVP-скелет**.

## Что включено в этом репозитории

- **`apps/api`**: Backend API (TypeScript, Fastify, PostgreSQL, Prisma, JWT, RBAC).
- **`apps/web`**: Frontend (React, Vite) — базовые экраны для входа/журналов/подач.
- **`infra`**: Docker Compose (PostgreSQL + MinIO).

## Быстрый старт (Windows / PowerShell)

1) Поднять инфраструктуру:

```powershell
cd D:\avtor
docker compose up -d
```

2) Установить зависимости:

```powershell
npm install
```

3) Применить миграции и запустить API:

```powershell
npm run db:migrate
npm run dev:api
```

4) Запустить веб-приложение:

```powershell
npm run dev:web
```

## Переменные окружения

См. `.env.example` в корне.

