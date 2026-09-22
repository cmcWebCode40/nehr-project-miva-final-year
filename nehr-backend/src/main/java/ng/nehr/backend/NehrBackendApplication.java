package ng.nehr.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class NehrBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(NehrBackendApplication.class, args);
    }
}
