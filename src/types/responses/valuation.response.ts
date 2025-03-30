/**
 * Basic shape of a valuation response
 */
export type ValuationResponse = {
  /**
   * Vehicle Registration Mark
   */
  vrm: string;
  
  /**
   * Lowest estimated value
   */
  lowestValue: number;
  
  /**
   * Highest estimated value
   */
  highestValue: number;
  
  /**
   * Provider that supplied the valuation
   */
  provider: string;
  
  /**
   * Midpoint value (calculated)
   */
  midpointValue: number;
}; 