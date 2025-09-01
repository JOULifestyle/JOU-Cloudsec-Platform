
## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, create a `.env.local` file in the root of the project with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Finally, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


## Cloud Security Dashboard

This frontend application connects to a backend API for cloud security scanning. Make sure the backend is running and accessible at the URL specified in `NEXT_PUBLIC_API_BASE_URL`.

## Project Status
Core features: FastAPI backend (CSPM/CWPP scans), Supabase auth, frontend, PostgreSQL integration.
Bonus feature: OPA policy evaluation for compliance (e.g., S3 public access).

### Features

- User authentication with Supabase
- Dashboard with scan statistics
- CSPM (Cloud Security Posture Management) scanning
- CWPP (Cloud Workload Protection Platform) scanning
- Scan history tracking
- AWS account configuration for multi-tenant scanning

### Pages

- `/auth/login` - Login page
- `/auth/signup` - Signup page
- `/dashboard` - Main dashboard with statistics
- `/dashboard/cspm` - CSPM scan page
- `/dashboard/cwpp` - CWPP scan page
- `/dashboard/history` - Scan history page
- `/dashboard/aws-account` - AWS account setup page
