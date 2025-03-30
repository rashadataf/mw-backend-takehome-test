import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { errorHandler } from '@app/middlewares/error-handler.middleware';
import { 
  ApplicationError,
  ValidationError, 
  NotFoundError,
  ServiceUnavailableError
} from '@app/core/errors/application-error';

describe('Error Handler Middleware', () => {
  // Setup mocks
  let mockRequest: FastifyRequest;
  let mockReply: FastifyReply;
  
  beforeEach(() => {
    // Setup request mock
    mockRequest = {
      log: {
        error: vi.fn()
      }
    } as unknown as FastifyRequest;
    
    // Setup reply mock
    mockReply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    } as unknown as FastifyReply;
  });
  
  it('should handle ValidationError correctly', () => {
    // Create error
    const error = new ValidationError('Invalid input');
    
    // Call handler
    errorHandler(error as FastifyError, mockRequest, mockReply);
    
    // Verify response
    expect(mockRequest.log.error).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Invalid input',
      statusCode: 400
    });
  });
  
  it('should handle NotFoundError correctly', () => {
    // Create error
    const error = new NotFoundError('Resource not found');
    
    // Call handler
    errorHandler(error as FastifyError, mockRequest, mockReply);
    
    // Verify response
    expect(mockRequest.log.error).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Resource not found',
      statusCode: 404
    });
  });
  
  it('should handle ServiceUnavailableError correctly', () => {
    // Create error
    const error = new ServiceUnavailableError('Service Unavailable');
    
    // Call handler
    errorHandler(error as FastifyError, mockRequest, mockReply);
    
    // Verify response
    expect(mockRequest.log.error).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(503);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Service Unavailable',
      statusCode: 503
    });
  });
  
  it('should handle database constraint errors correctly', () => {
    // Create error
    const error = {
      code: 'SQLITE_CONSTRAINT',
      message: 'Database constraint error'
    } as FastifyError;
    
    // Call handler
    errorHandler(error, mockRequest, mockReply);
    
    // Verify response
    expect(mockRequest.log.error).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(409);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Resource already exists',
      statusCode: 409
    });
  });
  
  it('should handle unknown errors in production mode', () => {
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    
    try {
      // Set to production
      process.env.NODE_ENV = 'production';
      
      // Create error
      const error = new Error('Something went wrong') as FastifyError;
      
      // Call handler
      errorHandler(error, mockRequest, mockReply);
      
      // Verify response
      expect(mockRequest.log.error).toHaveBeenCalled();
      expect(mockReply.code).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Internal Server Error',
        statusCode: 500
      });
    } finally {
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    }
  });
  
  it('should handle unknown errors in development mode', () => {
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    
    try {
      // Set to development
      process.env.NODE_ENV = 'development';
      
      // Create error with stack
      const error = new Error('Something went wrong') as FastifyError;
      error.stack = 'Error stack trace';
      
      // Call handler
      errorHandler(error, mockRequest, mockReply);
      
      // Verify response includes stack trace in dev mode
      expect(mockRequest.log.error).toHaveBeenCalled();
      expect(mockReply.code).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: 'Something went wrong',
        statusCode: 500,
        stack: 'Error stack trace'
      });
    } finally {
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    }
  });
  
  it('should handle any ApplicationError subclass correctly', () => {
    // Create a custom application error
    class CustomError extends ApplicationError {
      constructor() {
        super('Custom error', 418); // I'm a teapot
      }
    }
    
    const error = new CustomError();
    
    // Call handler
    errorHandler(error as FastifyError, mockRequest, mockReply);
    
    // Verify response
    expect(mockRequest.log.error).toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(418);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Custom error',
      statusCode: 418
    });
  });
}); 