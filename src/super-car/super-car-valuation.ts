import axios from 'axios';

import { VehicleValuation } from '../models/vehicle-valuation';
import { SuperCarValuationResponse } from './types/super-car-valuation-response';

const SUPER_CAR_API_URL = process.env.SUPER_CAR_API_URL;

export async function fetchValuationFromSuperCarValuation(
  vrm: string,
  mileage: number,
): Promise<VehicleValuation> {

  try {
    const response = await axios.get<SuperCarValuationResponse>(
      `${SUPER_CAR_API_URL}/valuations/${vrm}`,
      {
        params: { mileage },
      }
    );

    if (!response.data.valuation) {
      throw new Error('Valuation data missing from response');
    }

    const valuation = new VehicleValuation();
    valuation.vrm = vrm;
    valuation.lowestValue = response.data.valuation.lowerValue;
    valuation.highestValue = response.data.valuation.upperValue;
    valuation.provider = 'SuperCar Valuations';

    return valuation;
  } catch (error) {
    const err = error as {
      message: string;
    }
    console.error();
    throw new Error(`Failed to fetch valuation from SuperCar API error for VRM ${vrm}: ${err.message}`);
  }
}
