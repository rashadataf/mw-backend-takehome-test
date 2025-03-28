import { fastify } from '~root/test/fastify';
import { VehicleValuationRequest } from '../types/vehicle-valuation-request';
import { Repository } from 'typeorm';
import { VehicleValuation } from '@app/models/vehicle-valuation';
import { Mock } from 'vitest'

describe('ValuationController (e2e)', () => {
  describe('PUT /valuations/', () => {
    it('should return 404 if VRM is missing', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations',
        method: 'PUT',
        body: requestBody,
      });

      expect(res.statusCode).toStrictEqual(404);
    });

    it('should return 400 if VRM is 8 characters or more', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations/12345678',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 400 if mileage is missing', async () => {
      const requestBody: VehicleValuationRequest = {
        // @ts-expect-error intentionally malformed payload
        mileage: null,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 400 if mileage is negative', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: -1,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 200 with valid request', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(200);
    });
  });

  describe('GET /valuations/', () => {
    let mockRepository: Partial<Repository<VehicleValuation>>;

    beforeEach(() => {
      mockRepository = {
        findOneBy: vi.fn(),
      };

      vi.spyOn(fastify.orm, 'getRepository').mockReturnValue(mockRepository as Repository<VehicleValuation>);
    });

    it('should return 400 if VRM is missing', async () => {
      const res = await fastify.inject({
        url: '/valuations/',
        method: 'GET',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 400 if VRM is longer than 7 characters', async () => {
      const res = await fastify.inject({
        url: '/valuations/12345678',
        method: 'GET',
      });

      expect(res.statusCode).toStrictEqual(400);
      expect(res.json()).toEqual({
        message: 'vrm must be 7 characters or less',
        statusCode: 400,
      });
    });

    it('should return 404 if VRM is not found in the database', async () => {
      (mockRepository.findOneBy as Mock).mockResolvedValue(null);

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        method: 'GET',
      });

      expect(res.statusCode).toStrictEqual(404);
      expect(res.json()).toEqual({
        message: 'Valuation for VRM ABC123 not found',
        statusCode: 404,
      });
    });

    it('should return 200 with valuation data if VRM exists', async () => {
      const mockValuation: VehicleValuation = {
        vrm: 'ABC123',
        lowestValue: 10000.0,
        highestValue: 20000.0,
        provider: '',
        get midpointValue() {
          return (this.highestValue + this.lowestValue) / 2;
        },
      };

      (mockRepository.findOneBy as Mock).mockResolvedValue(mockValuation);

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        method: 'GET',
      });

      expect(res.statusCode).toStrictEqual(200);
      expect(res.json()).toEqual(mockValuation);
    });
  });
});
