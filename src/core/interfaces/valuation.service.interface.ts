import { FastifyRequest } from 'fastify';
import { VehicleValuation } from '@app/models/vehicle-valuation';

/**
 * Interface for the valuation service
 * Defines contract that any valuation service implementation must follow
 */
export interface IValuationService {
  /**
   * Get a valuation by Vehicle Registration Mark (VRM)
   * @param request FastifyRequest object
   * @param vrm Vehicle Registration Mark
   * @returns Vehicle valuation if found
   * @throws NotFoundError if no valuation found
   * @throws ValidationError if VRM is invalid
   */
  getValuation(request: FastifyRequest, vrm: string): Promise<VehicleValuation>;
  
  /**
   * Create a new valuation or return existing one
   * @param request FastifyRequest object
   * @param vrm Vehicle Registration Mark
   * @param mileage Vehicle mileage
   * @returns Vehicle valuation (new or existing)
   * @throws ValidationError if inputs are invalid
   * @throws ServiceUnavailableError if no valuation provider available
   */
  createValuation(request: FastifyRequest, vrm: string, mileage: number): Promise<VehicleValuation>;
} 