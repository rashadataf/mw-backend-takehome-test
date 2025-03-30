/**
 * Base application error class
 * All custom errors should extend this class
 */
export class ApplicationError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for invalid input data
 */
export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Error for resource not found
 */
export class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Error for resource already exists
 */
export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Error for unavailable service
 */
export class ServiceUnavailableError extends ApplicationError {
  constructor(message: string) {
    super(message, 503);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Error for unauthorized access
 */
export class UnauthorizedError extends ApplicationError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error for forbidden access
 */
export class ForbiddenError extends ApplicationError {
  constructor(message: string) {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
} 