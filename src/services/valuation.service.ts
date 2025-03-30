import { FastifyRequest } from 'fastify';
import { BaseService } from '@app/core/abstracts/base.service';
import { IValuationService } from '@app/core/interfaces/valuation.service.interface';
import { NotFoundError, ServiceUnavailableError } from '@app/core/errors/application-error';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { FailureTracker } from '@app/utils/failure-tracker';
import { fetchValuationFromSuperCarValuation } from '@app/super-car/super-car-valuation';
import { fetchValuationFromPremiumCarValuation } from '@app/premium-car/premium-car-valuation';
import { saveProviderLog } from '@app/utils/provider-logs';
import { config } from '@app/config';

/**
 * Service handling vehicle valuation business logic
 */
export class ValuationService extends BaseService implements IValuationService {
  private failureTracker: FailureTracker;

  constructor() {
    super();
    this.failureTracker = new FailureTracker(
      config.valuation.failover.thresholdRate,
      config.valuation.failover.durationMs
    );
  }

  /**
   * Get vehicle valuation by VRM
   * @param request FastifyRequest object
   * @param vrm Vehicle Registration Mark
   * @returns Vehicle valuation
   * @throws NotFoundError if no valuation found
   * @throws ValidationError if VRM is invalid
   */
  async getValuation(request: FastifyRequest, vrm: string): Promise<VehicleValuation> {
    // Validate VRM
    this.validateVrm(vrm);

    // Get valuation from database
    const valuationRepository = this.getRepository(request, VehicleValuation);
    const result = await valuationRepository.findOneBy({ vrm }) as VehicleValuation | null;

    // Return 404 if not found
    if (result == null) {
      throw new NotFoundError(`Valuation for VRM ${vrm} not found`);
    }

    return result;
  }

  /**
   * Create a new valuation or return existing one
   * @param request FastifyRequest object
   * @param vrm Vehicle Registration Mark
   * @param mileage Vehicle mileage
   * @returns Vehicle valuation (new or existing)
   * @throws ValidationError if inputs are invalid
   * @throws ServiceUnavailableError if no valuation provider available
   */
  async createValuation(
    request: FastifyRequest, 
    vrm: string, 
    mileage: number
  ): Promise<VehicleValuation> {
    // Validate inputs
    this.validateVrm(vrm);
    this.validateMileage(mileage);

    // Check if valuation exists (to prevent unnecessary API calls)
    const valuationRepository = this.getRepository(request, VehicleValuation);
    const existingValuation = await valuationRepository.findOneBy({ vrm }) as VehicleValuation | null;
    
    if (existingValuation) {
      return existingValuation;
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

    return valuation;
  }
} 