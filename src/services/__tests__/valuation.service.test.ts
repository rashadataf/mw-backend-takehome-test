import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValuationService } from '../valuation.service';
import { ValidationError } from '@app/core/errors/application-error';
import { FastifyRequest } from 'fastify';

describe('ValuationService - Validation Tests', () => {
  let service: ValuationService;
  
  // Simple mock request
  const mockRequest = {
    server: {
      orm: {
        getRepository: vi.fn().mockReturnValue({
          findOneBy: vi.fn(),
          insert: vi.fn(),
        }),
      }
    },
    log: {
      error: vi.fn(),
    }
  } as unknown as FastifyRequest;
  
  beforeEach(() => {
    service = new ValuationService();
    vi.resetAllMocks();
  });
  
  describe('validation', () => {
    it('should throw ValidationError when VRM is too long', async () => {
      await expect(() => 
        service.getValuation(mockRequest, '12345678')
      ).rejects.toThrow(ValidationError);
      
      await expect(() => 
        service.getValuation(mockRequest, '12345678')
      ).rejects.toThrow('vrm must be 7 characters or less');
    });
    
    it('should throw ValidationError when VRM is empty', async () => {
      await expect(() => 
        service.getValuation(mockRequest, '')
      ).rejects.toThrow(ValidationError);
      
      await expect(() => 
        service.getValuation(mockRequest, '')
      ).rejects.toThrow('VRM is required');
    });
    
    it('should throw ValidationError for negative mileage', async () => {
      await expect(() => 
        service.createValuation(mockRequest, 'ABC123', -100)
      ).rejects.toThrow(ValidationError);
      
      await expect(() => 
        service.createValuation(mockRequest, 'ABC123', -100)
      ).rejects.toThrow('Mileage must be greater than zero');
    });
    
    it('should throw ValidationError for zero mileage', async () => {
      await expect(() => 
        service.createValuation(mockRequest, 'ABC123', 0)
      ).rejects.toThrow(ValidationError);
      
      await expect(() => 
        service.createValuation(mockRequest, 'ABC123', 0)
      ).rejects.toThrow('Mileage is required');
    });
  });
}); 