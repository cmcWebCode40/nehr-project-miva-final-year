# Deploying nehr-backend to a personal server

Bare-metal/VPS deployment — no Docker, no cloud PaaS assumed. Written for
a single Linux server (Ubuntu/Debian commands shown; adjust for other
distros) that will run the backend, MySQL, and Redis all on one box,
which is entirely fine at this project's scale.

## 1. Server prerequisites

```bash
sudo apt update
sudo apt install -y openjdk-21-jre-headless mysql-server redis-server
java -version   # confirm 21.x
```

Java 21 is a **hard requirement** (records, the language features the
codebase uses). The JRE (not the full JDK) is enough to *run* the jar —
you only need the JDK where you *build* it.

## 2. Build the jar

Do this wherever you have the JDK + Maven (your machine, or the server
itself if it has the full JDK installed instead of just the JRE):

```bash
cd nehr-backend
mvn clean package -DskipTests
```

This produces `target/nehr-backend-0.1.0-SNAPSHOT.jar` — a self-contained
executable jar (Tomcat included, via `spring-boot-maven-plugin`). Copy it
to the server:

```bash
scp target/nehr-backend-0.1.0-SNAPSHOT.jar youruser@SERVER_IP:/opt/nehr/nehr-backend.jar
```

(`-DskipTests` just speeds up the build for a deploy — run `mvn test`
yourself first if you want the full crypto test-vector suite to gate it.)

## 3. Set up MySQL and Redis on the server

Both should stay bound to `localhost` only — nothing external ever needs
to reach them directly, only the backend process on the same machine.

```bash
sudo mysql -e "
CREATE DATABASE nehr CHARACTER SET utf8mb4;
CREATE USER 'nehr'@'localhost' IDENTIFIED BY 'REPLACE_WITH_A_REAL_PASSWORD';
GRANT ALL PRIVILEGES ON nehr.* TO 'nehr'@'localhost';
FLUSH PRIVILEGES;
"
sudo systemctl enable --now mysql redis-server
```

Use a real, unique password here — **not** the `nehr_local_dev` one from
local development. Flyway creates every table automatically on first
boot; there's nothing to import manually.

## 4. Configure environment variables

Every value below has an insecure or localhost-only default meant for a
laptop — **override all of them** for a real deployment:

| Variable | Purpose |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` | MySQL connection (defaults assume `localhost:3306`, fine if MySQL is on the same box) |
| `REDIS_HOST`, `REDIS_PORT` | Redis connection (same — fine if local) |
| `JWT_SECRET` | **Must be set explicitly.** A long random string (`openssl rand -base64 48`). Never reuse the dev default. |
| `PLATFORM_ADMIN_EMAIL`, `PLATFORM_ADMIN_DEFAULT_PASSWORD` | The seeded platform admin account. **Change the password from `ChangeMe123!`.** |
| `CORS_ALLOWED_ORIGINS` | The exact origin(s) the web portal will be served from, e.g. `https://nehr.yourdomain.com` (comma-separated if more than one) |
| `SERVER_PORT` | Defaults to `8080` |

Put these in an env file the service will load, e.g. `/opt/nehr/backend.env`:

```bash
DB_PASSWORD=REPLACE_WITH_A_REAL_PASSWORD
JWT_SECRET=REPLACE_WITH_OUTPUT_OF_openssl_rand_-base64_48
PLATFORM_ADMIN_EMAIL=admin@yourdomain.com
PLATFORM_ADMIN_DEFAULT_PASSWORD=REPLACE_WITH_A_REAL_PASSWORD
CORS_ALLOWED_ORIGINS=https://nehr.yourdomain.com
```

## 5. Run it as a systemd service

`/etc/systemd/system/nehr-backend.service`:

```ini
[Unit]
Description=NEHR backend
After=network.target mysql.service redis-server.service

[Service]
EnvironmentFile=/opt/nehr/backend.env
ExecStart=/usr/bin/java -jar /opt/nehr/nehr-backend.jar
Restart=on-failure
User=nehr
WorkingDirectory=/opt/nehr

[Install]
WantedBy=multi-user.target
```

```bash
sudo useradd -r -s /usr/sbin/nologin nehr   # dedicated non-login user, optional but good practice
sudo systemctl daemon-reload
sudo systemctl enable --now nehr-backend
sudo systemctl status nehr-backend          # confirm it's running
journalctl -u nehr-backend -f               # tail logs
```

## 6. Expose it so the frontend can reach it

**Option A — bare IP, no domain (quickest, fine for a demo):**

```bash
sudo ufw allow 8080/tcp   # or your provider's firewall/security-group equivalent
```

The API is now reachable at `http://SERVER_PUBLIC_IP:8080/api/v1`. Point
the frontend's `NEXT_PUBLIC_API_URL` at that, and make sure
`CORS_ALLOWED_ORIGINS` (step 4) matches wherever the frontend is actually
served from.

**Option B — a real domain + HTTPS (recommended if you have one):**

Put Nginx in front as a reverse proxy and get a free cert:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

`/etc/nginx/sites-available/nehr-backend`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/nehr-backend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.yourdomain.com   # issues + auto-configures HTTPS
```

Now the API is at `https://api.yourdomain.com/api/v1` — use that as
`NEXT_PUBLIC_API_URL`, keep port 8080 closed to the outside world
(`ufw` should *not* allow 8080 in this option, only Nginx's 80/443), and
set `CORS_ALLOWED_ORIGINS` to the frontend's real HTTPS origin.

## 7. Verify

```bash
curl -I http://SERVER_PUBLIC_IP:8080/swagger-ui.html        # Option A
curl -I https://api.yourdomain.com/swagger-ui.html           # Option B
```

A `302` (redirecting into the Swagger UI) means the app booted, Flyway
migrated the schema, and it's reachable. Log in as the platform admin
(the email/password from step 4) via `/swagger-ui.html` or the web
portal to confirm the database and seeded account are both correct.

## Redeploying after a change

```bash
mvn clean package -DskipTests
scp target/nehr-backend-0.1.0-SNAPSHOT.jar youruser@SERVER_IP:/opt/nehr/nehr-backend.jar
ssh youruser@SERVER_IP 'sudo systemctl restart nehr-backend'
```

Flyway migrations run automatically on that restart — no manual schema
step needed as long as new migrations are numbered correctly and shipped
in the jar.
