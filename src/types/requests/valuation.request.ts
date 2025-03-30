/**
 * Vehicle valuation request type
 * Used for PUT requests to create/update valuations
 */
export type VehicleValuationRequest = {
  /**
   * Vehicle mileage, must be a positive number
   */
  mileage: number;
};

/**
 * Vehicle valuation params type
 * Used for route parameters in valuation endpoints
 */
export type VehicleValuationParams = {
  /**
   * Vehicle Registration Mark (VRM), max 7 characters
   */
  vrm: string;
}; 