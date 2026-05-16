// app/api/tailor/route.js
// Tailor a resume for a specific job using Anthropic Claude.
// Accepts an API key from the request body (so users can BYO key) or falls back to env.

import { extractSkills } from '@/lib/skills';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM = `You are a resume tailoring assistant. Take a candidate's existing resume and tailor it for a specific job.

CONSTRAINTS — violating any of these is a failure:
1. Never invent experience, skills, titles, education, or accomplishments the candidate doesn't already have.
2. You may REORDER, REPHRASE, and SURFACE existing content. You may NOT add new content.
3. If a JD skill is missing from the resume, note it in "gaps" — do NOT add it to the resume body.
4. Preserve dates, company names, titles, and education exactly.

Return STRICT JSON only (no markdown fences):
{
  "summary": "1-3 line professional summary tailored to the JD",
  "experience": [{"company":"...","title":"...","dates":"...","bullets":["...","..."]}],
  "skills_to_highlight": ["..."],
  "gaps": ["JD skills not in resume — DO NOT add to resume body"]
}`;

export async function POST(req) {
  try {
    const { resumeText, jobTitle, jobDescription, jobCompany, apiKey } = await req.json();
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) return Response.json({ error: 'No API key. Paste yours in Settings or set ANTHROPIC_API_KEY in env.' }, { status: 400 });
    if (!resumeText || !jobTitle) return Response.json({ error: 'resumeText and jobTitle required' }, { status: 400 });

    const userPrompt = `=== JOB ===
Title: ${jobTitle}
${jobCompany ? `Company: ${jobCompany}` : ''}

${jobDescription || ''}

=== RESUME ===
${resumeText}

Tailor the resume. Output strict JSON only.`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        system: SYSTEM,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return Response.json({ error: `Anthropic ${res.status}: ${txt.slice(0, 200)}` }, { status: 500 });
    }
    const data = await res.json();
    const text = (data.content || []).map(b => b.text || '').join('').trim();
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    let parsed;
    try { parsed = JSON.parse(cleaned); }
    catch { return Response.json({ error: 'Model returned non-JSON', raw: text }, { status: 500 }); }

    // Validate: no new skills introduced.
    const orig = new Set(extractSkills(resumeText).skills);
    const introduced = extractSkills(JSON.stringify(parsed)).skills.filter(s => !orig.has(s));
    return Response.json({ ...parsed, _validation: { passed: introduced.length === 0, introduced_skills: introduced } });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
