import { Prisma } from '@prisma/client';

const DB_UNAVAILABLE_MESSAGE =
  'Database is unavailable. Start Docker Desktop, then run `npm run db:up` and try again.';

export function getDatabaseUnavailableMessage(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return DB_UNAVAILABLE_MESSAGE;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P1001' || error.code === 'P1017' || error.code === 'P1000') {
      return DB_UNAVAILABLE_MESSAGE;
    }
  }

  if (error instanceof Error && error.message.includes("Can't reach database server")) {
    return DB_UNAVAILABLE_MESSAGE;
  }

  return null;
}

export function isDatabaseUnavailable(error: unknown): boolean {
  return getDatabaseUnavailableMessage(error) !== null;
}
