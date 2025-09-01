This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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
