package ng.nehr.backend.common.web;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("auth")
                .displayName("Auth")
                .pathsToMatch("/api/v1/auth/**", "/api/v1/hospitals/**", "/api/v1/platform-admin/**")
                .build();
    }

    @Bean
    public GroupedOpenApi didRegistryApi() {
        return GroupedOpenApi.builder()
                .group("did-registry")
                .displayName("DID Registry")
                .pathsToMatch("/api/v1/dids/**")
                .build();
    }

    @Bean
    public GroupedOpenApi credentialsApi() {
        return GroupedOpenApi.builder()
                .group("credentials")
                .displayName("Credentials")
                .pathsToMatch("/api/v1/doctors/**", "/api/v1/patients/**", "/api/v1/credentials/**")
                .build();
    }
}
