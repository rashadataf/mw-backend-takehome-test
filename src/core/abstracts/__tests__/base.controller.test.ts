import { describe, it, expect, vi } from 'vitest';
import { FastifyInstance, FastifyReply } from 'fastify';
import { BaseController } from '@app/core/abstracts/base.controller';
import { ValidationError } from '@app/core/errors/application-error';

// Create a concrete controller for testing
class TestController extends BaseController {
  registerRoutes(fastify: FastifyInstance): void {
    // Empty implementation for testing
    fastify; // Reference fastify to avoid linter error
  }
  
  // Expose protected methods for testing
  public exposedSendSuccess<T>(reply: FastifyReply, data: T, statusCode?: number) {
    return this.sendSuccess(reply, data, statusCode);
  }
  
  public exposedSendError(reply: FastifyReply, message: string, statusCode?: number) {
    return this.sendError(reply, message, statusCode);
  }
  
  public exposedValidateVrm(vrm: string) {
    return this.validateVrm(vrm);
  }
  
  public exposedValidateMileage(mileage: number) {
    return this.validateMileage(mileage);
  }
}

describe('BaseController', () => {
  let controller: TestController;
  let mockReply: FastifyReply;
  
  beforeEach(() => {
    controller = new TestController();
    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    } as unknown as FastifyReply;
  });
  
  describe('sendSuccess', () => {
    it('should send success response with default status code 200', () => {
      const data = { id: 1, name: 'Test' };
      
      controller.exposedSendSuccess(mockReply, data);
      
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith(data);
    });
    
    it('should send success response with custom status code', () => {
      const data = { id: 1, name: 'Test' };
      
      controller.exposedSendSuccess(mockReply, data, 201);
      
      expect(mockReply.code).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith(data);
    });
  });
  
  describe('sendError', () => {
    it('should send error response with default status code 500', () => {
      controller.exposedSendError(mockReply, 'Error message');
      
      expect(mockReply.code).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Error message',
        statusCode: 500
      });
    });
    
    it('should send error response with custom status code', () => {
      controller.exposedSendError(mockReply, 'Not found', 404);
      
      expect(mockReply.code).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Not found',
        statusCode: 404
      });
    });
  });
  
  describe('validateVrm', () => {
    it('should pass for valid VRM', () => {
      expect(() => controller.exposedValidateVrm('ABC123')).not.toThrow();
    });
    
    it('should throw for null VRM', () => {
      expect(() => controller.exposedValidateVrm(null as unknown as string)).toThrow(ValidationError);
    });
    
    it('should throw for empty VRM', () => {
      expect(() => controller.exposedValidateVrm('')).toThrow(ValidationError);
    });
    
    it('should throw for VRM longer than 7 characters', () => {
      expect(() => controller.exposedValidateVrm('ABCD1234')).toThrow(ValidationError);
    });
  });
  
  describe('validateMileage', () => {
    it('should pass for valid mileage', () => {
      expect(() => controller.exposedValidateMileage(10000)).not.toThrow();
    });
    
    it('should throw for null mileage', () => {
      expect(() => controller.exposedValidateMileage(null as unknown as number)).toThrow(ValidationError);
    });
    
    it('should throw for zero mileage', () => {
      expect(() => controller.exposedValidateMileage(0)).toThrow(ValidationError);
    });
    
    it('should throw for negative mileage', () => {
      expect(() => controller.exposedValidateMileage(-100)).toThrow(ValidationError);
    });
  });
}); 