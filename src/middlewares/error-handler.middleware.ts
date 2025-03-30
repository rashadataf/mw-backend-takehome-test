import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ApplicationError } from '@app/core/errors/application-error';

/**
 * Interface for database errors
 */
interface DatabaseError {
  code?: string;
  errno?: number;
  message: string;
}

/**
 * Middleware for handling errors consistently across the application
 * 
 * @param error The error that was thrown
 * @param request The Fastify request object
 * @param reply The Fastify reply object
 */
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): FastifyReply {
  request.log.error(`Error: ${error.message}`);
  
  // Handle application-specific errors
  if (error instanceof ApplicationError) {
    return reply
      .code(error.statusCode)
      .send({
        message: error.message,
        statusCode: error.statusCode,
      });
  }
  
  // Handle TypeORM errors
  const dbError = error as DatabaseError;
  if (dbError.code === 'SQLITE_CONSTRAINT') {
    return reply
      .code(409)
      .send({
        message: 'Resource already exists',
        statusCode: 409,
      });
  }

  // For unexpected errors, don't expose internals in production
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction ? 'Internal Server Error' : error.message;
  
  // Default to internal server error
  return reply
    .code(500)
    .send({
      message,
      statusCode: 500,
      ...(isProduction ? {} : { stack: error.stack }),
    });
} 