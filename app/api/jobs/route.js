// app/api/jobs/route.js
// Server-side aggregator. Cached at the Vercel edge for 5 min.

import { fetchAllJobs } from '@/lib/sources';

export const revalidate = 300;
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET() {
  try {
    const jobs = await fetchAllJobs();
    return Response.json({ jobs, count: jobs.length, fetched_at: new Date().toISOString() }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (e) {
    return Response.json({ error: e.message, jobs: [] }, { status: 500 });
  }
}
