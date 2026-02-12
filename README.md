# Advent Frontend

Frontend for the Advent challenge platform, built with React + TypeScript + Vite.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Clerk authentication

## Features

- Authentication with Clerk (email/password + Google OAuth)
- Protected routes for signed-in users
- Challenge calendar and daily challenge flow
- Progress, recap, pulse, profile, and capsules pages
- Theme preference sync with backend profile

## Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm 9+
- Advent backend API running locally or remotely

## Getting Started

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:8081
VITE_CLERK_JWT_TEMPLATE=
VITE_RECAP_V2_ENABLED=false
```

Start development server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - Start local Vite dev server
- `npm run build` - Type-check and create production build
- `npm run preview` - Preview production build locally

## Route Overview

- `/onboard`
- `/sso-callback`
- `/`
- `/progress`
- `/capsules`
- `/recap`
- `/pulse`
- `/profile`

## Build Output

Production files are generated in `dist/`.

