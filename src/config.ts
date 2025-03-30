/**
 * Application configuration
 * Centralizes all environment variables and configuration values
 */
export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    pluginTimeout: parseInt(process.env.PLUGIN_TIMEOUT || '50000', 10),
    bodyLimit: parseInt(process.env.BODY_LIMIT || '15485760', 10),
  },
  database: {
    path: process.env.DATABASE_PATH || 'database.sqlite',
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
      thresholdRate: parseFloat(process.env.FAILOVER_THRESHOLD || '0.5'),
      durationMs: parseInt(process.env.FAILOVER_DURATION_MS || String(5 * 60 * 1000), 10), // 5 minutes default
    },
  },
}; 