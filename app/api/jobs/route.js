// app/api/jobs/route.js
import { fetchAllJobs } from '@/lib/sources';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET() {
  try {
    const jobs = await fetchAllJobs();
    return Response.json(
      { jobs, count: jobs.length, fetched_at: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch (e) {
    return Response.json({ error: e.message, jobs: [] }, { status: 500 });
  }
}
