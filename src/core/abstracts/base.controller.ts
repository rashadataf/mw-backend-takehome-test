import { FastifyInstance, FastifyReply } from 'fastify';
import { Controller } from '@app/core/interfaces/controller.interface';

/**
 * Base controller implementing common controller functionality
 */
export abstract class BaseController implements Controller {
  /**
   * Register all routes for this controller
   * @param fastify The Fastify instance
   */
  abstract registerRoutes(fastify: FastifyInstance): void;

  /**
   * Send a success response
   * @param reply The Fastify reply object
   * @param data The data to send
   * @param statusCode The HTTP status code (default: 200)
   */
  protected sendSuccess<T>(
    reply: FastifyReply, 
    data: T, 
    statusCode = 200
  ): FastifyReply {
    return reply.code(statusCode).send(data);
  }

  /**
   * Send an error response
   * @param reply The Fastify reply object
   * @param message The error message
   * @param statusCode The HTTP status code (default: 500)
   */
  protected sendError(
    reply: FastifyReply, 
    message: string, 
    statusCode = 500
  ): FastifyReply {
    return reply.code(statusCode).send({
      message,
      statusCode,
    });
  }
} 