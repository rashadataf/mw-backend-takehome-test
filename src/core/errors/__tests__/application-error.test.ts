import { describe, it, expect } from 'vitest';
import { 
  ApplicationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  ServiceUnavailableError,
  UnauthorizedError,
  ForbiddenError
} from '@app/core/errors/application-error';

describe('ApplicationError', () => {
  it('should set the correct properties', () => {
    const error = new ApplicationError('Test error');
    
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('ApplicationError');
    expect(error.statusCode).toBe(500); // Default status code
  });
  
  it('should allow custom status code', () => {
    const error = new ApplicationError('Test error', 418);
    
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(418);
  });
  
  it('should capture stack trace', () => {
    const error = new ApplicationError('Test error');
    
    expect(error.stack).toBeDefined();
  });
  
  describe('ValidationError', () => {
    it('should set the correct properties', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('ValidationError');
      expect(error.statusCode).toBe(400);
    });
  });
  
  describe('NotFoundError', () => {
    it('should set the correct properties', () => {
      const error = new NotFoundError('Resource not found');
      
      expect(error.message).toBe('Resource not found');
      expect(error.name).toBe('NotFoundError');
      expect(error.statusCode).toBe(404);
    });
  });
  
  describe('ConflictError', () => {
    it('should set the correct properties', () => {
      const error = new ConflictError('Resource already exists');
      
      expect(error.message).toBe('Resource already exists');
      expect(error.name).toBe('ConflictError');
      expect(error.statusCode).toBe(409);
    });
  });
  
  describe('ServiceUnavailableError', () => {
    it('should set the correct properties', () => {
      const error = new ServiceUnavailableError('Service unavailable');
      
      expect(error.message).toBe('Service unavailable');
      expect(error.name).toBe('ServiceUnavailableError');
      expect(error.statusCode).toBe(503);
    });
  });
  
  describe('UnauthorizedError', () => {
    it('should set the correct properties', () => {
      const error = new UnauthorizedError('Unauthorized');
      
      expect(error.message).toBe('Unauthorized');
      expect(error.name).toBe('UnauthorizedError');
      expect(error.statusCode).toBe(401);
    });
  });
  
  describe('ForbiddenError', () => {
    it('should set the correct properties', () => {
      const error = new ForbiddenError('Forbidden');
      
      expect(error.message).toBe('Forbidden');
      expect(error.name).toBe('ForbiddenError');
      expect(error.statusCode).toBe(403);
    });
  });
}); 