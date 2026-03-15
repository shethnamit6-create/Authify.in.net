# Authify Backend

Authify is a cloud Identity Provider (IdP) delivering phishing-resistant, passwordless MFA and IAM as a SaaS platform. Client companies integrate via REST APIs and delegate authentication to Authify.

## Setup

1. Install dependencies:

```bash
cd authify-backend
npm install
```

2. Create `.env` from `.env.example` and set values.

3. Start MongoDB locally or point `MONGO_URI` to your cluster.

4. Run the server:

```bash
npm run dev
```

5. (Optional) Seed development data:

```bash
node src/scripts/seed.js
```

## Client Integration Sequence

1. Register a company:
   - `POST /api/v1/company/register`
2. Create an application:
   - `POST /api/v1/applications`
3. Store `clientId` and `apiKey`.
4. Send `X-API-Key` and `x-client-id` headers on all Authify API calls from your app.
5. Add a "Sign in with Authify" button to your app.
6. On login, call `POST /api/v1/auth/options` and pass options to `navigator.credentials.get()`.
7. Send the WebAuthn response to `POST /api/v1/auth/verify` to receive a JWT.

## REST API Reference

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/v1/company/register` | Register company | None |
| POST | `/api/v1/company/login` | Company login | None |
| POST | `/api/v1/company/apikey/rotate` | Rotate API key | Company JWT |
| POST | `/api/v1/applications` | Create application | Company JWT |
| GET | `/api/v1/applications` | List applications | Company JWT |
| PATCH | `/api/v1/applications/:appId` | Update application | Company JWT |
| DELETE | `/api/v1/applications/:appId` | Soft-delete application | Company JWT |
| POST | `/api/v1/register/options` | WebAuthn registration options | API Key |
| POST | `/api/v1/register/verify` | Verify registration | API Key |
| POST | `/api/v1/auth/options` | WebAuthn authentication options | API Key |
| POST | `/api/v1/auth/verify` | Verify authentication | API Key |
| POST | `/api/v1/auth/crossdevice/init` | Init QR flow | API Key |
| GET | `/api/v1/auth/crossdevice/status/:sessionId` | Poll QR status | API Key |
| POST | `/api/v1/auth/crossdevice/verify` | Verify QR assertion | API Key |
| POST | `/api/v1/recovery/request` | Request recovery | API Key |
| POST | `/api/v1/recovery/admin/verify/:requestId` | Admin verify recovery | Company JWT |
| POST | `/api/v1/recovery/complete` | Complete recovery | API Key |
| GET | `/api/v1/audit/logs` | List audit logs | Company JWT |
| GET | `/api/v1/audit/logs/verify` | Verify hash chain | Company JWT |
| GET | `/api/v1/audit/export` | Export logs | Company JWT |
| GET | `/api/v1/dashboard/usage` | Usage for billing period | Company JWT |
| GET | `/api/v1/dashboard/stats` | Auth success/failure | Company JWT |
| GET | `/api/v1/dashboard/users` | List users per app | Company JWT |

## WebAuthn Flow

1. Client calls `/register/options` with `identifier`, `displayName`, `applicationId`.
2. Authify responds with `PublicKeyCredentialCreationOptions`.
3. Client uses `navigator.credentials.create()` and sends the response to `/register/verify`.
4. For login, client calls `/auth/options`, then `navigator.credentials.get()`, then `/auth/verify`.
5. Authify returns a signed JWT scoped to the application.

## Audit Log Verification

1. Call `GET /api/v1/audit/logs/verify`.
2. Authify recomputes the hash chain for each user.
3. If tampering is detected, the response includes `brokenAt` log id.

## Notes

- Authify rejects any request containing fields named `biometric`, `fingerprint`, or `face`.
- WebAuthn credentials are scoped by `companyId` and `applicationId`.
- API keys are returned only once at creation or rotation.
- Challenge TTL defaults to 5 minutes.
