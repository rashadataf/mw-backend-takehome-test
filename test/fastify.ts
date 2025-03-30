import { beforeAll, afterAll } from 'vitest'
import { app } from '@app/app'
import { Repository } from 'typeorm';
import { VehicleValuation } from '@app/models/vehicle-valuation';

export const fastify = app()

beforeAll(async () => {
  // called once before all tests run
  vi.mock('@app/super-car/super-car-valuation', () => ({
    fetchValuationFromSuperCarValuation: vi.fn().mockResolvedValue({
      vrm: 'ABC123',
      lowestValue: 10000.0,
      highestValue: 20000.0,
      provider: 'SuperCar Valuations',
    }),
  }));

  vi.mock("@app/premium-car/premium-car-valuation", () => ({
    fetchValuationFromPremiumCarValuation: vi.fn().mockResolvedValue({
      vrm: 'ABC123',
      lowestValue: 10000.0,
      highestValue: 20000.0,
      provider: 'Premium Car Valuations',
    }),
  }));

  await fastify.ready()

  const mockRepository: Partial<Repository<VehicleValuation>> = {
    insert: vi.fn().mockResolvedValue({}),
    findOneBy: vi.fn(),
  };

  vi.spyOn(fastify.orm, 'getRepository').mockReturnValue(mockRepository as Repository<VehicleValuation>);
})
afterAll(async () => {
  // called once after all tests run
  vi.restoreAllMocks();
  await fastify.close()
})
