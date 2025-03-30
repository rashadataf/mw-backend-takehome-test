import { FastifyInstance } from 'fastify';

/**
 * Base controller interface
 * Defines the structure for all controllers in the application
 */
export interface Controller {
  /**
   * Register all routes handled by this controller
   * @param fastify The Fastify instance
   */
  registerRoutes(fastify: FastifyInstance): void;
} 