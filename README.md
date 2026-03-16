# Authify.in.net

Authify is a passwordless identity platform that combines face verification with optional step-up factors (email OTP, magic link, backup codes). It provides a backend API and a frontend console for managing authentication, audits, recovery, and security settings.

## What's in this repo
- `authify-backend`: Node/Express API, MongoDB, email delivery, MFA flows.
- `authify-frontend/authify`: Next.js frontend for registration, login, and admin console.

## Quick start (local)
1. Install dependencies:
   - `cd authify-backend && npm install`
   - `cd ../authify-frontend/authify && npm install`
2. Configure env files:
   - Backend: `authify-backend/.env` (see `.env.example`)
   - Frontend: `authify-frontend/authify/.env.local`
3. Run locally:
   - Backend: `cd authify-backend && npm run dev`
   - Frontend: `cd authify-frontend/authify && npm run dev`

## Core flows
- Register user → face enrollment → optional MFA preferences.
- Login → face verification → optional factors → token issued.
- Optional factors: email OTP, magic link, backup codes.

## Production
- Frontend: `https://authify.in.net`
- Backend API: `https://api.authify.in.net`

## Notes
- Do not commit secrets or `.env*` files.
- Backup codes are emailed when users enable them.
