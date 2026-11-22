import { DrizzleError, DrizzleQueryError } from 'drizzle-orm';
import { DatabaseError } from 'pg';

const getField = (error: DatabaseError): string | undefined => {
  if (error.column) return error.column;
  const match = error.detail?.match(/^Key \(([^)]+)\)=/);
  return match?.[1]?.replace(/"/g, '');
};

export const formatDatabaseError = (error: unknown) => {
  let pgError: DatabaseError | null = null;
  if (error instanceof DatabaseError) {
    pgError = error;
  } else if (error instanceof DrizzleQueryError && error.cause instanceof DatabaseError) {
    pgError = error.cause;
  }

  const isDbError =
    pgError !== null || error instanceof DrizzleQueryError || error instanceof DrizzleError;

  if (!isDbError) return null;

  const field = pgError ? getField(pgError) : undefined;

  switch (pgError?.code) {
    case '23505':
      return {
        statusCode: 409,
        error: 'Conflict',
        message: field ? `Value for '${field}' already exists.` : 'Resource already exists.',
        field,
      };
    case '23503':
      return {
        statusCode: 400,
        error: 'Bad Request',
        message: field
          ? `Invalid reference for '${field}'.`
          : 'Referenced resource does not exist.',
        field,
      };
    case '23502':
      return {
        statusCode: 400,
        error: 'Bad Request',
        message: field ? `Field '${field}' is required.` : 'Missing required field.',
        field,
      };
    case '23514':
      return {
        statusCode: 400,
        error: 'Bad Request',
        message: field ? `Invalid value for '${field}'.` : 'Invalid data value.',
        field,
      };
    case '22P02':
      return { statusCode: 400, error: 'Bad Request', message: 'Invalid input format.' };
    case '22001':
      return { statusCode: 400, error: 'Bad Request', message: 'Input value is too long.' };
    case '22003':
      return { statusCode: 400, error: 'Bad Request', message: 'Numeric value is out of range.' };
    case '40001':
      return { statusCode: 409, error: 'Conflict', message: 'Transaction conflict, please retry.' };
    case '40P01':
      return { statusCode: 409, error: 'Conflict', message: 'Deadlock detected, please retry.' };
    case '53300':
      return { statusCode: 503, error: 'Service Unavailable', message: 'Database unavailable.' };
    case '57014':
      return { statusCode: 504, error: 'Gateway Timeout', message: 'Database request timed out.' };
    default:
      return { statusCode: 500, error: 'Internal Server Error', message: 'Internal server error.' };
  }
};
