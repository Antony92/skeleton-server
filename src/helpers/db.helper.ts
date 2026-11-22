import { DrizzleError, DrizzleQueryError } from 'drizzle-orm';
import { DatabaseError } from 'pg';

export type ApiErrorResponse = {
  error: string;
  statusCode: number;
  message: string;
};

const DEFAULT_DB_ERROR: ApiErrorResponse = {
  error: 'Internal Server Error',
  statusCode: 500,
  message: 'Internal server error.',
};

const PG_ERROR_MAP: Record<string, ApiErrorResponse> = {
  '22001': {
    error: 'Bad Request',
    statusCode: 400,
    message: 'Input value is too long.',
  },
  '22003': {
    error: 'Bad Request',
    statusCode: 400,
    message: 'Numeric value is out of range.',
  },
  '22P02': {
    error: 'Bad Request',
    statusCode: 400,
    message: 'Invalid input format.',
  },
  '23502': {
    error: 'Bad Request',
    statusCode: 400,
    message: 'Missing required field.',
  },
  '23503': {
    error: 'Bad Request',
    statusCode: 400,
    message: 'Referenced resource does not exist.',
  },
  '23505': {
    error: 'Conflict',
    statusCode: 409,
    message: 'Resource already exists.',
  },
  '23514': {
    error: 'Bad Request',
    statusCode: 400,
    message: 'Invalid data value.',
  },
  '40001': {
    error: 'Conflict',
    statusCode: 409,
    message: 'Transaction conflict, please retry.',
  },
  '40P01': {
    error: 'Conflict',
    statusCode: 409,
    message: 'Deadlock detected, please retry.',
  },
  '53300': {
    error: 'Service Unavailable',
    statusCode: 503,
    message: 'Database is temporarily unavailable.',
  },
  '57014': {
    error: 'Gateway Timeout',
    statusCode: 504,
    message: 'Database request timed out.',
  },
};

const getPgErrorCode = (error: unknown): string | undefined => {
  if (error instanceof DatabaseError) {
    return error.code;
  }
  if (error instanceof DrizzleQueryError && error.cause instanceof DatabaseError) {
    return error.cause.code;
  }
  return undefined;
};

export const formatDatabaseError = (error: unknown): ApiErrorResponse | null => {
  const isDbError =
    error instanceof DrizzleQueryError ||
    error instanceof DrizzleError ||
    error instanceof DatabaseError;

  if (!isDbError) {
    return null;
  }

  const code = getPgErrorCode(error);
  if (code && code in PG_ERROR_MAP) {
    return PG_ERROR_MAP[code];
  }

  return DEFAULT_DB_ERROR;
};
