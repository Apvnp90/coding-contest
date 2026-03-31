import { ApplicationInsights } from '@microsoft/applicationinsights-web';

let appInsights = null;
const connectionString = process.env.REACT_APP_APPINSIGHTS_CONNECTION_STRING;

if (connectionString) {
  appInsights = new ApplicationInsights({
    config: {
      connectionString: connectionString,
      enableAutoRouteTracking: true,
      disableFetchTracking: false,
      disableAjaxTracking: false
    }
  });
  appInsights.loadAppInsights();
  appInsights.trackPageView();
}

export default appInsights;
