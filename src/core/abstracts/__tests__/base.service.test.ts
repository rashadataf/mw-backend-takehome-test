import { describe, it, expect } from 'vitest';
import { BaseService } from '@app/core/abstracts/base.service';
import { ValidationError } from '@app/core/errors/application-error';

// Create a concrete service for testing
class TestService extends BaseService {
  // Expose protected methods for testing
  public exposedValidateVrm(vrm: string) {
    return this.validateVrm(vrm);
  }
  
  public exposedValidateMileage(mileage: number) {
    return this.validateMileage(mileage);
  }
}

describe('BaseService', () => {
  let service: TestService;
  
  beforeEach(() => {
    service = new TestService();
  });
  
  describe('validateVrm', () => {
    it('should pass for valid VRM', () => {
      expect(() => service.exposedValidateVrm('ABC123')).not.toThrow();
    });
    
    it('should throw for null VRM', () => {
      expect(() => service.exposedValidateVrm(null as unknown as string)).toThrow(ValidationError);
      expect(() => service.exposedValidateVrm(null as unknown as string)).toThrow('VRM is required');
    });
    
    it('should throw for empty VRM', () => {
      expect(() => service.exposedValidateVrm('')).toThrow(ValidationError);
      expect(() => service.exposedValidateVrm('')).toThrow('VRM is required');
    });
    
    it('should throw for VRM longer than 7 characters', () => {
      expect(() => service.exposedValidateVrm('ABCD1234')).toThrow(ValidationError);
      expect(() => service.exposedValidateVrm('ABCD1234')).toThrow('vrm must be 7 characters or less');
    });
  });
  
  describe('validateMileage', () => {
    it('should pass for valid mileage', () => {
      expect(() => service.exposedValidateMileage(10000)).not.toThrow();
    });
    
    it('should throw for null mileage', () => {
      expect(() => service.exposedValidateMileage(null as unknown as number)).toThrow(ValidationError);
      expect(() => service.exposedValidateMileage(null as unknown as number)).toThrow('Mileage is required');
    });
    
    it('should throw for zero mileage', () => {
      expect(() => service.exposedValidateMileage(0)).toThrow(ValidationError);
      expect(() => service.exposedValidateMileage(0)).toThrow('Mileage is required');
    });
    
    it('should throw for negative mileage', () => {
      expect(() => service.exposedValidateMileage(-100)).toThrow(ValidationError);
      expect(() => service.exposedValidateMileage(-100)).toThrow('Mileage must be greater than zero');
    });
  });
}); 