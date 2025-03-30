/**
 * Helper to safely parse an integer with fallback
 */
function safeParseInt(value: string | undefined, defaultValue: number): number {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Helper to safely parse a float with fallback
 */
function safeParseFloat(value: string | undefined, defaultValue: number): number {
  if (value === undefined) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Application configuration
 * Centralizes all environment variables and configuration values
 */
export const config = {
  server: {
    port: safeParseInt(process.env.PORT, 3000),
    host: process.env.HOST || '0.0.0.0',
    pluginTimeout: safeParseInt(process.env.PLUGIN_TIMEOUT, 50000),
    bodyLimit: safeParseInt(process.env.BODY_LIMIT, 15485760),
  },
  database: {
    path: process.env.DATABASE_PATH || 'database/database.sqlite',
    synchronize: process.env.SYNC_DATABASE === 'true',
  },
  valuation: {
    providers: {
      superCar: {
        apiUrl: process.env.SUPER_CAR_API_URL || 'https://run.mocky.io/v3/9245229e-5c57-44e1-964b-36c7fb29168b',
        name: 'SuperCar Valuations',
      },
      premiumCar: {
        apiUrl: process.env.PREMIUM_CAR_API_URL || 'https://run.mocky.io/v3/0dfda26a-3a5a-43e5-b68c-51f148eda473',
        name: 'Premium Car Valuations',
      },
    },
    failover: {
      thresholdRate: safeParseFloat(process.env.FAILOVER_THRESHOLD, 0.5),
      durationMs: safeParseInt(process.env.FAILOVER_DURATION_MS, 5 * 60 * 1000), // 5 minutes default
    },
  },
}; 