import { FastifyInstance } from 'fastify';
import { VehicleValuationRequest } from './types/vehicle-valuation-request';
import { fetchValuationFromSuperCarValuation } from '@app/super-car/super-car-valuation';
import { FailureTracker } from '@app/utils/failure-tracker';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { saveProviderLog } from '@app/utils/provider-logs';
import { fetchValuationFromPremiumCarValuation } from '@app/premium-car/premium-car-valuation';

const failureTracker = new FailureTracker();

export function valuationRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {
    const valuationRepository = fastify.orm.getRepository(VehicleValuation);
    const { vrm } = request.params;

    if (vrm === null || vrm === '' || vrm.length > 7) {
      return reply
        .code(400)
        .send({ message: 'vrm must be 7 characters or less', statusCode: 400 });
    }

    const result = await valuationRepository.findOneBy({ vrm: vrm });

    if (result == null) {
      return reply
        .code(404)
        .send({
          message: `Valuation for VRM ${vrm} not found`,
          statusCode: 404,
        });
    }

    return result;
  });

  fastify.put<{
    Body: VehicleValuationRequest;
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {
    const valuationRepository = fastify.orm.getRepository(VehicleValuation);
    const { vrm } = request.params;
    const { mileage } = request.body;

    if (vrm.length > 7) {
      return reply
        .code(400)
        .send({ message: 'vrm must be 7 characters or less', statusCode: 400 });
    }

    if (mileage === null || mileage <= 0) {
      return reply
        .code(400)
        .send({
          message: 'mileage must be a positive number',
          statusCode: 400,
        });
    }

    // Check if valuation exists (to prevent unnecessary API calls)
    let valuation = await valuationRepository.findOneBy({ vrm: vrm });
    if (valuation) {
      return valuation;
    }

    // Fetch valuation with failover logic
    let responseCode = 200;
    const startTime = Date.now();

    try {
      if (failureTracker.shouldFailover()) {
        valuation = await fetchValuationFromPremiumCarValuation(vrm);
      } else {
        valuation = await fetchValuationFromSuperCarValuation(vrm, mileage);
        failureTracker.trackRequest(true);
      }
    } catch (error) {
      failureTracker.trackRequest(false); // Mark failure
      responseCode = 503;
      console.error(`Error fetching valuation for ${vrm}:`, error);

      if (failureTracker.shouldFailover()) {
        valuation = await fetchValuationFromPremiumCarValuation(vrm);
      } else {
        return reply.code(503).send({ message: 'Service Unavailable', statusCode: 503 });
      }
    }

    if (!valuation) {
      return null;
    }
    try {
      await valuationRepository.insert(valuation);
    } catch (error: unknown) {
      const err = error as {
        code: string;
      };
      if (err.code !== 'SQLITE_CONSTRAINT') throw err;
    }

    // Log request details
    await saveProviderLog(fastify, vrm, valuation.provider, startTime, Date.now(), responseCode);

    return valuation;
  });
}
