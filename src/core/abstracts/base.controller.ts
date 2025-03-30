import { FastifyInstance, FastifyReply } from 'fastify';
import { Controller } from '@app/core/interfaces/controller.interface';
import { ValidationError } from '@app/core/errors/application-error';

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

  /**
   * Handle common validation for VRM (Vehicle Registration Mark)
   * @param vrm The VRM to validate
   * @throws ValidationError if VRM is invalid
   */
  protected validateVrm(vrm: string): void {
    if (vrm === null || vrm === '' || vrm.length > 7) {
      throw new ValidationError('vrm must be 7 characters or less');
    }
  }

  /**
   * Handle common validation for mileage
   * @param mileage The mileage to validate
   * @throws ValidationError if mileage is invalid
   */
  protected validateMileage(mileage: number): void {
    if (mileage === null || mileage===undefined || mileage <= 0) {
      throw new ValidationError('mileage must be a positive number');
    }
  }
} 