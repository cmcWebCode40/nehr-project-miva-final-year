package ng.nehr.backend.account.platformadmin;

import ng.nehr.backend.common.config.NehrProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Seeds exactly one platform admin on first boot, if none exists yet. */
@Component
public class PlatformAdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PlatformAdminSeeder.class);

    private final PlatformAdminRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final NehrProperties.PlatformAdmin seed;

    public PlatformAdminSeeder(PlatformAdminRepository repository, PasswordEncoder passwordEncoder,
                                NehrProperties properties) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.seed = properties.platformAdmin();
    }

    @Override
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }
        repository.save(new PlatformAdmin(seed.email(), passwordEncoder.encode(seed.defaultPassword()), seed.name()));
        log.warn("Seeded platform admin '{}' with the configured default password - change it before any real deployment.",
                seed.email());
    }
}
