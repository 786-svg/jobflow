// lib/sources.js
// Server-side fetchers. Runs in Vercel serverless functions, no CORS limits.

import { GREENHOUSE, LEVER, ASHBY } from './companies.js';

const UA = 'JobFlow/1.0 (job aggregator)';

function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim();
}

function detectWorkType(text, sourceRemoteOnly) {
  if (sourceRemoteOnly) return 'remote';
  const t = (text || '').toLowerCase();
  if (/\bhybrid\b/.test(t)) return 'hybrid';
  if (/\b(fully\s+remote|100%\s+remote|remote[- ]first|remote[- ]only|work\s+from\s+anywhere|distributed)\b/.test(t)) return 'remote';
  if (/\bremote\b/.test(t)) {
    if (/\bremote\s*[,/-]\s*[a-z]/i.test(t) || /[a-z]+\s*[,/-]\s*remote/i.test(t)) return 'hybrid';
    return 'remote';
  }
  return 'onsite';
}

const cap = s => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');

async function tryFetch(url, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: ctrl.signal });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; } finally { clearTimeout(t); }
}

async function fetchRemoteOK() {
  const data = await tryFetch('https://remoteok.com/api', 10000);
  if (!Array.isArray(data)) return [];
  return data.slice(1).filter(j => j && j.position).map(j => ({
    id: `ro-${j.id}`,
    source: 'remoteok',
    company: j.company,
    title: j.position,
    location: j.location || 'Remote',
    workType: 'remote',
    tags: (j.tags || []).slice(0, 6),
    description: stripHtml(j.description || ''),
    posted_at: j.date,
    apply_url: j.url || j.apply_url,
  }));
}

async function fetchGH(slug) {
  const data = await tryFetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`);
  if (!data?.jobs) return [];
  return data.jobs.map(j => {
    const loc = j.location?.name || '';
    const departments = (j.departments || []).map(d => d.name).filter(Boolean);
    const description = stripHtml(j.content || '');
    return {
      id: `gh-${slug}-${j.id}`,
      source: 'greenhouse',
      company: cap(slug),
      title: j.title,
      location: loc || null,
      workType: detectWorkType(loc + ' ' + j.title + ' ' + departments.join(' ') + ' ' + description, false),
      tags: departments,
      description,
      posted_at: j.first_published || j.updated_at,
      apply_url: j.absolute_url,
    };
  });
}

async function fetchLV(slug) {
  const data = await tryFetch(`https://api.lever.co/v0/postings/${slug}?mode=json`);
  if (!Array.isArray(data)) return [];
  return data.map(j => {
    const cats = j.categories || {};
    const desc = stripHtml((j.descriptionPlain || j.description || '') + ' ' + (j.additionalPlain || j.additional || ''));
    const tags = [cats.team, cats.department, cats.commitment].filter(Boolean);
    return {
      id: `lv-${j.id}`,
      source: 'lever',
      company: cap(slug),
      title: j.text,
      location: cats.location || null,
      workType: detectWorkType((cats.location || '') + ' ' + j.text + ' ' + desc, false),
      tags,
      description: desc,
      posted_at: j.createdAt ? new Date(j.createdAt).toISOString() : null,
      apply_url: j.hostedUrl || j.applyUrl,
    };
  });
}

async function fetchAS(slug) {
  const data = await tryFetch(`https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true`);
  if (!data?.jobs) return [];
  const companyName = data.jobBoard?.name || cap(slug);
  return data.jobs.map(j => {
    const desc = stripHtml(j.descriptionHtml || j.descriptionPlain || '');
    const tags = [j.department, j.team, j.employmentType].filter(Boolean);
    let wt;
    if (j.isRemote === true) wt = 'remote';
    else wt = detectWorkType((j.locationName || '') + ' ' + j.title + ' ' + desc, false);
    return {
      id: `as-${j.id}`,
      source: 'ashby',
      company: companyName,
      title: j.title,
      location: j.locationName || null,
      workType: wt,
      tags,
      description: desc,
      posted_at: j.publishedAt,
      apply_url: j.applyUrl || j.jobUrl,
    };
  });
}

export async function fetchAllJobs() {
  const tasks = [
    fetchRemoteOK(),
    ...GREENHOUSE.map(fetchGH),
    ...LEVER.map(fetchLV),
    ...ASHBY.map(fetchAS),
  ];
  const settled = await Promise.allSettled(tasks);
  const jobs = [];
  for (const r of settled) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) jobs.push(...r.value);
  }
  return jobs
    .filter(j => j.apply_url && j.posted_at)
    .sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));
}
