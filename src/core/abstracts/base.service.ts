import { FastifyRequest } from 'fastify';
import { ValidationError } from '@app/core/errors/application-error';

/**
 * Base abstract class for all services
 * Provides common functionality and enforces consistent interface
 */
export abstract class BaseService {
  /**
   * Get the repository for the service
   * @param request The Fastify request with ORM access
   * @param entityType The entity class to get the repository for
   * @returns The repository instance
   */
  protected getRepository<T>(request: FastifyRequest, entityType: new () => T) {
    return request.server.orm.getRepository(entityType);
  }

  /**
   * Handle common validation for VRM (Vehicle Registration Mark)
   * @param vrm The VRM to validate
   * @throws ValidationError if VRM is invalid
   */
  protected validateVrm(vrm: string): void {
    if (!vrm) {
      throw new ValidationError('VRM is required');
    }
    
    if (vrm.length > 7) {
      throw new ValidationError('vrm must be 7 characters or less');
    }
  }

  /**
   * Handle common validation for mileage
   * @param mileage The mileage to validate
   * @throws ValidationError if mileage is invalid
   */
  protected validateMileage(mileage: number): void {
    if (!mileage) {
      throw new ValidationError('Mileage is required');
    }
    
    if (mileage <= 0) {
      throw new ValidationError('Mileage must be greater than zero');
    }
  }
} 