import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import { BaseController } from '../core/abstracts/base.controller';
import { NotFoundError, ServiceUnavailableError } from '@app/core/errors/application-error';
import { fetchValuationFromSuperCarValuation } from '@app/super-car/super-car-valuation';
import { FailureTracker } from '@app/utils/failure-tracker';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { saveProviderLog } from '@app/utils/provider-logs';
import { fetchValuationFromPremiumCarValuation } from '@app/premium-car/premium-car-valuation';
import { config } from '@app/config';
import { VehicleValuationRequest, VehicleValuationParams } from '@app/types';

/**
 * Controller for valuation-related endpoints
 */
class ValuationController extends BaseController {
  private failureTracker: FailureTracker;

  constructor() {
    super();
    this.failureTracker = new FailureTracker(
      config.valuation.failover.thresholdRate,
      config.valuation.failover.durationMs
    );
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

    // Validate VRM
    this.validateVrm(vrm);

    // Get valuation from database
    const valuationRepository = request.server.orm.getRepository(VehicleValuation);
    const result = await valuationRepository.findOneBy({ vrm });

    // Return 404 if not found
    if (result == null) {
      throw new NotFoundError(`Valuation for VRM ${vrm} not found`);
    }

    return this.sendSuccess(reply, result);
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

    // Validate inputs
    this.validateVrm(vrm);
    this.validateMileage(mileage);

    // Check if valuation exists (to prevent unnecessary API calls)
    const valuationRepository = request.server.orm.getRepository(VehicleValuation);
    const existingValuation = await valuationRepository.findOneBy({ vrm });
    
    if (existingValuation) {
      return this.sendSuccess(reply, existingValuation);
    }

    // Fetch valuation with failover logic
    let valuation: VehicleValuation | null = null;
    let responseCode = 200;
    let errorMessage: string | undefined;
    
    const startTime = Date.now();
    let provider = 'SuperCar Valuations';

    try {
      if (this.failureTracker.shouldFailover()) {
        valuation = await fetchValuationFromPremiumCarValuation(vrm);
        provider = 'Premium Car Valuations';
      } else {
        valuation = await fetchValuationFromSuperCarValuation(vrm, mileage);
        this.failureTracker.trackRequest(true);
      }
    } catch (error) {
      this.failureTracker.trackRequest(false);
      responseCode = 503;
      errorMessage = (error as Error).message;
      request.log.error(`Error fetching valuation for ${vrm}:`, error);

      if (this.failureTracker.shouldFailover()) {
        try {
          valuation = await fetchValuationFromPremiumCarValuation(vrm);
          provider = 'Premium Car Valuations';
        } catch (fallbackError) {
          throw new ServiceUnavailableError('All valuation providers failed');
        }
      } else {
        throw new ServiceUnavailableError('Service Unavailable');
      }
    }

    if (!valuation) {
      throw new ServiceUnavailableError('No valuation available');
    }

    // Save the valuation
    try {
      await valuationRepository.insert(valuation);
    } catch (error: unknown) {
      const err = error as { code: string };
      if (err.code !== 'SQLITE_CONSTRAINT') throw error;
    }

    // Log request details
    await saveProviderLog(
      request.server, 
      vrm, 
      provider, 
      startTime, 
      Date.now(), 
      responseCode, 
      errorMessage
    );

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
  const controller = new ValuationController();
  controller.registerRoutes(fastify);
  done();
} 