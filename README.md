# Global Guestbook

A simple Next.js app used to test and observe request latency when reading and writing data with Upstash Redis.

## Why this project exists

This project is a small sandbox to:

- measure Redis operation latency from an app context
- compare behavior across local development and deployed environments
- provide a clear baseline before trying optimization ideas

## Tech stack

- Next.js (App Router)
- React
- Upstash Redis

## Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env.local` file in the project root:

```bash
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
```

You can get both values from your Upstash Redis database settings.

### 3) Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Latency testing workflow

1. Trigger guestbook read/write actions through the UI.
2. Record response times for each action.
3. Repeat tests multiple times and compare min/avg/max latency.
4. Run the same flow in a deployed environment for comparison.

## Notes

- Keep test conditions consistent (network, region, payload size) to make results meaningful.
- Start with simple measurements first, then introduce caching or batching strategies and compare.
