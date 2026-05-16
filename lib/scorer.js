// lib/scorer.js
// Resume-to-job fit scorer with breakdown.

import { extractSkills } from './skills.js';

const WEIGHTS = { skills: 0.55, title: 0.20, seniority: 0.10, location: 0.10, recency: 0.05 };
const STOP = new Set(['a','an','the','of','and','or','for','with','to','in','at','on','sr','jr','i','ii','iii','iv']);

export function tokenizeTitle(t) {
  if (!t) return [];
  return String(t).toLowerCase().replace(/[^\w\s+#.]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w));
}

export function detectSeniority(text) {
  const t = (text || '').toLowerCase();
  if (/\b(intern|internship)\b/.test(t)) return { level: 'intern', rank: 0 };
  if (/\b(junior|jr\.?|entry[ -]level|new grad|graduate)\b/.test(t)) return { level: 'junior', rank: 1 };
  if (/\b(principal|distinguished|fellow)\b/.test(t)) return { level: 'principal', rank: 5 };
  if (/\bstaff\b/.test(t)) return { level: 'staff', rank: 4 };
  if (/\b(senior|sr\.?|lead)\b/.test(t)) return { level: 'senior', rank: 3 };
  if (/\b(manager|director|head of|vp|chief)\b/.test(t)) return { level: 'manager', rank: 4 };
  return { level: 'mid', rank: 2 };
}

export function detectYears(text) {
  if (!text) return 0;
  const m = text.match(/(\d{1,2})\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/gi) || [];
  let max = 0;
  for (const s of m) { const n = parseInt(s.match(/\d+/)[0], 10); if (n > max) max = n; }
  return max;
}

export function workTypeMatch(jobLoc, jobWorkType, prefRemote) {
  if (!prefRemote) return 50;
  if (jobWorkType === 'remote') return 100;
  if (jobWorkType === 'hybrid') return 70;
  return 30;
}

function scoreSkills(jd, res) {
  if (!jd.size) return 50;
  const overlap = [...jd].filter(s => res.has(s)).length;
  const recall = overlap / jd.size;
  const breadth = Math.min(res.size / 20, 1) * 0.15;
  return Math.min(100, (recall * 100) + breadth * 100);
}

function scoreTitle(jobTitle, resumeText) {
  const jt = new Set(tokenizeTitle(jobTitle));
  if (!jt.size) return 50;
  const lines = (resumeText || '').split(/\n+/).filter(l => l.length < 200);
  let best = 0;
  for (const line of lines) {
    const lt = new Set(tokenizeTitle(line));
    if (!lt.size) continue;
    const inter = [...jt].filter(t => lt.has(t)).length;
    const union = new Set([...jt, ...lt]).size;
    const j = inter / union;
    if (j > best) best = j;
  }
  return best * 100;
}

function scoreSeniorityFn(jobTitle, resumeText) {
  const j = detectSeniority(jobTitle);
  const r = detectSeniority(resumeText || '');
  const years = detectYears(resumeText || '');
  let adj = r.rank;
  if (years >= 8 && adj < 4) adj = 4;
  else if (years >= 5 && adj < 3) adj = 3;
  else if (years >= 2 && adj < 2) adj = 2;
  const d = Math.abs(j.rank - adj);
  if (d === 0) return 100;
  if (d === 1) return 75;
  if (d === 2) return 40;
  return 10;
}

function scoreLocation(resumeLoc, job) {
  if (job.workType === 'remote') return 100;
  if (!job.location) return 50;
  if (!resumeLoc) return 50;
  const r = resumeLoc.toLowerCase();
  const j = (job.location || '').toLowerCase();
  if (j.includes(r) || r.includes(j.split(',')[0].trim())) return 100;
  return 25;
}

function scoreRecency(postedAt) {
  if (!postedAt) return 50;
  const days = (Date.now() - new Date(postedAt).getTime()) / 86400000;
  if (days <= 1) return 100;
  if (days <= 7) return 85;
  if (days <= 14) return 65;
  if (days <= 30) return 40;
  return 15;
}

export function scoreMatch(resume, job) {
  const jdSk = extractSkills(`${job.title}\n${job.description || ''}\n${(job.tags||[]).join(' ')}`);
  const resSk = extractSkills(resume.text || '');
  const jd = new Set(jdSk.skills);
  const res = new Set(resSk.skills);

  const skills = scoreSkills(jd, res);
  const title = scoreTitle(job.title, resume.text);
  const seniority = scoreSeniorityFn(job.title, resume.text);
  const location = scoreLocation(resume.location, job);
  const recency = scoreRecency(job.posted_at || job.date);

  const composite =
    WEIGHTS.skills * skills +
    WEIGHTS.title * title +
    WEIGHTS.seniority * seniority +
    WEIGHTS.location * location +
    WEIGHTS.recency * recency;

  return {
    score: Math.round(composite),
    breakdown: {
      skills: { score: Math.round(skills),
                matched: [...jd].filter(s => res.has(s)),
                missing: [...jd].filter(s => !res.has(s)) },
      title: { score: Math.round(title) },
      seniority: { score: Math.round(seniority) },
      location: { score: Math.round(location) },
      recency: { score: Math.round(recency) },
    },
  };
}
