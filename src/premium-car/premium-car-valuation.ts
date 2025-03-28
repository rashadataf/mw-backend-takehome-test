import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { PremiumCarValuationResponse } from './types';
import { VehicleValuation } from '@app/models/vehicle-valuation';

const PREMIUM_CAR_API_URL = process.env.PREMIUM_CAR_API_URL;

export async function fetchValuationFromPremiumCarValuation(vrm: string) {
  try {
    const response = await axios.get<string>(`${PREMIUM_CAR_API_URL}/valueCar`, {
      params: { vrm },
      headers: { 'Accept': 'application/xml' },
    });

    const result: PremiumCarValuationResponse = await parseStringPromise(response.data);

    const valuation = new VehicleValuation();
    valuation.vrm = vrm;
    valuation.lowestValue = parseFloat(result.root.ValuationPrivateSaleMinimum[0]);
    valuation.highestValue = parseFloat(result.root.ValuationPrivateSaleMaximum[0]);
    valuation.provider = 'Premium Car Valuations';

    return valuation;
  } catch (error) {
    const err = error as {
      message: string;
    }
    throw new Error(`Failed to fetch valuation from Premium Car Valuations API, error for VRM ${vrm}: ${err.message}`);
  }
}
