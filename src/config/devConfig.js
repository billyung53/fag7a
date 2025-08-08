// config/devConfig.js
// Development configuration for testing features
// Set SHOW_DEVICE_INFO to false before pushing to production

export const DEV_CONFIG = {
  // Toggle DeviceInfoPanel visibility
  SHOW_DEVICE_INFO: false, // Set to false for production
  
  // Other dev features can be added here
  SHOW_DEBUG_LOGS: false,
  ENABLE_PERFORMANCE_MONITORING: true,
  
  // Environment detection
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production'
};

export default DEV_CONFIG;
