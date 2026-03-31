package contest.code_challenge.config;

import com.microsoft.applicationinsights.TelemetryClient;
import com.microsoft.applicationinsights.web.internal.WebRequestTrackingFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationInsightsConfig {

    @Value("${application.insights.connection-string:}")
    private String connectionString;

    @Bean
    public TelemetryClient telemetryClient() {
        TelemetryClient telemetryClient = new TelemetryClient();
        
        if (connectionString != null && !connectionString.isEmpty()) {
            telemetryClient.getContext().getInstrumentationKey();
        }
        
        return telemetryClient;
    }

    @Bean
    public FilterRegistrationBean<WebRequestTrackingFilter> webRequestTrackingFilter() {
        FilterRegistrationBean<WebRequestTrackingFilter> registrationBean = new FilterRegistrationBean<>();
        
        WebRequestTrackingFilter filter = new WebRequestTrackingFilter();
        registrationBean.setFilter(filter);
        registrationBean.addUrlPatterns("/*");
        registrationBean.setOrder(1);
        
        return registrationBean;
    }
}
