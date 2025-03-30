import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest';

describe('Config Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Clean up env vars before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original env vars
    process.env = originalEnv;
  });

  it('should use default values when environment variables are not set', async () => {
    // Import the config fresh to use current env vars
    const { config } = await import('../config');
    
    // Test server defaults
    expect(config.server.port).toBe(3000);
    expect(config.server.host).toBe('0.0.0.0');
    expect(config.server.pluginTimeout).toBe(50000);
    expect(config.server.bodyLimit).toBe(15485760);
    
    // Test database defaults
    expect(config.database.path).toBe('database/database.sqlite');
    expect(config.database.synchronize).toBe(false);
    
    // Test provider defaults
    expect(config.valuation.providers.superCar.name).toBe('SuperCar Valuations');
    expect(config.valuation.providers.premiumCar.name).toBe('Premium Car Valuations');
    
    // Test failover defaults
    expect(config.valuation.failover.thresholdRate).toBe(0.5);
    expect(config.valuation.failover.durationMs).toBe(5 * 60 * 1000); // 5 minutes
  });

  it('should use environment variables when provided', async () => {
    // Set environment variables
    process.env.PORT = '8080';
    process.env.HOST = '127.0.0.1';
    process.env.DATABASE_PATH = 'custom.sqlite';
    process.env.SYNC_DATABASE = 'true';
    process.env.FAILOVER_THRESHOLD = '0.7';
    process.env.FAILOVER_DURATION_MS = '600000'; // 10 minutes
    
    // Import the config fresh to use updated env vars
    const { config } = await import('../config');
    
    // Test environment variable overrides
    expect(config.server.port).toBe(8080);
    expect(config.server.host).toBe('127.0.0.1');
    expect(config.database.path).toBe('custom.sqlite');
    expect(config.database.synchronize).toBe(true);
    expect(config.valuation.failover.thresholdRate).toBe(0.7);
    expect(config.valuation.failover.durationMs).toBe(600000);
  });

  it('should handle invalid environment variable values gracefully', async () => {
    // Set invalid environment variables
    process.env.PORT = 'not-a-number';
    process.env.FAILOVER_THRESHOLD = 'invalid';
    
    // Import the config fresh to use updated env vars
    const { config } = await import('../config');
    
    // Should fall back to defaults for invalid values
    expect(config.server.port).toBe(3000); // Default
    expect(config.valuation.failover.thresholdRate).toBe(0.5); // Default
  });
}); 