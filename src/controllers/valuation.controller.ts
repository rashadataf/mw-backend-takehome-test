import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import { BaseController } from '@app/core/abstracts/base.controller';
import { VehicleValuationParams, VehicleValuationRequest } from '@app/types';
import { ValuationService } from '@app/services/valuation.service';
import { IValuationService } from '@app/core/interfaces/valuation.service.interface';

/**
 * Controller for valuation-related endpoints
 * Handles HTTP routing and delegates business logic to the ValuationService
 */
export class ValuationController extends BaseController {
  private valuationService: IValuationService;

  constructor(valuationService: IValuationService) {
    super();
    this.valuationService = valuationService;
  }

  /**
   * Register valuation routes
   * @param fastify The Fastify instance
   */
  registerRoutes(fastify: FastifyInstance): void {
    // GET route to get a valuation
    fastify.get<{
      Params: VehicleValuationParams;
    }>(
      '/:vrm',
      async (request, reply) => this.getValuation(request, reply)
    );

    // PUT route to create a valuation
    fastify.put<{
      Body: VehicleValuationRequest;
      Params: VehicleValuationParams;
    }>(
      '/:vrm',
      async (request, reply) => this.createValuation(request, reply)
    );
  }

  /**
   * Get a valuation by VRM
   */
  async getValuation(
    request: FastifyRequest<{
      Params: VehicleValuationParams;
    }>,
    reply: FastifyReply
  ) {
    const { vrm } = request.params;
    
    const valuation = await this.valuationService.getValuation(request, vrm);
    
    return this.sendSuccess(reply, valuation);
  }

  /**
   * Create a new valuation
   */
  async createValuation(
    request: FastifyRequest<{
      Body: VehicleValuationRequest;
      Params: VehicleValuationParams;
    }>,
    reply: FastifyReply
  ) {
    const { vrm } = request.params;
    const { mileage } = request.body;
    
    const valuation = await this.valuationService.createValuation(request, vrm, mileage);
    
    return this.sendSuccess(reply, valuation);
  }
}

/**
 * Valuation router plugin
 * @param fastify Fastify instance
 * @param opts Plugin options
 * @param done Callback for completion
 */
export function valuationRouter(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  done: () => void
): void {
  const valuationService = new ValuationService();
  const controller = new ValuationController(valuationService);
  controller.registerRoutes(fastify);
  done();
} 