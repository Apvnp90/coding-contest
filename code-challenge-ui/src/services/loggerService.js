import appInsights from './appInsights';

const loggerService = {
  error: (message, error, context = {}) => {
    console.error(`[ERROR] ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      context,
      timestamp: new Date().toISOString()
    });
    
    // Send to Application Insights
    if (appInsights) {
      appInsights.trackException({
        exception: error instanceof Error ? error : new Error(message),
        properties: { message, ...context }
      });
    }
  },

  warn: (message, context = {}) => {
    console.warn(`[WARN] ${message}`, { context, timestamp: new Date().toISOString() });
    if (appInsights) {
      appInsights.trackTrace({
        message: `[WARN] ${message}`,
        severityLevel: 2,
        properties: context
      });
    }
  },

  info: (message, context = {}) => {
    console.info(`[INFO] ${message}`, { context, timestamp: new Date().toISOString() });
    if (appInsights) {
      appInsights.trackTrace({
        message: `[INFO] ${message}`,
        severityLevel: 1,
        properties: context
      });
    }
  },

  debug: (message, context = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, { context });
    }
  }
};

export default loggerService;
