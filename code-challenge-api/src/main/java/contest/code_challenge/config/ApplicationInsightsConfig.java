package contest.code_challenge.config;

import com.microsoft.applicationinsights.TelemetryClient;
import com.microsoft.applicationinsights.TelemetryConfiguration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationInsightsConfig {

    @Value("${application.insights.connection-string:}")
    private String connectionString;

    @Bean
    public TelemetryClient telemetryClient() {
        TelemetryConfiguration configuration = TelemetryConfiguration.createDefault();
        
        if (connectionString != null && !connectionString.isEmpty()) {
            configuration.setConnectionString(connectionString);
        }
        
        return new TelemetryClient(configuration);
    }
}
