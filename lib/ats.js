// lib/ats.js
// ATS compatibility checker. Returns 0-100 score plus per-category breakdown.

import { extractSkills } from './skills.js';

const WEIGHTS = {
  parseability: 25, keywords: 30, formatting: 15,
  contact: 10, fileFormat: 10, length: 5, actionVerbs: 5,
};

const STRONG_VERBS = new Set([
  'led','built','designed','shipped','launched','created','developed','architected',
  'engineered','implemented','reduced','increased','improved','optimized','migrated',
  'automated','mentored','managed','owned','drove','delivered','scaled','streamlined',
  'spearheaded','pioneered','established','analyzed','researched','collaborated',
]);

export function checkAts({ text, fileType = 'pdf-text' }, jobDescription) {
  const fixes = [];
  const breakdown = {};
  breakdown.parseability = parseability(text, fixes);
  breakdown.keywords = keywords(text, jobDescription, fixes);
  breakdown.formatting = formatting(text, fixes);
  breakdown.contact = contact(text, fixes);
  breakdown.fileFormat = fileFormat(fileType, fixes);
  breakdown.length = lengthCheck(text, fixes);
  breakdown.actionVerbs = actionVerbs(text, fixes);
  let score = 0;
  for (const [cat, w] of Object.entries(WEIGHTS)) score += (breakdown[cat].score / 100) * w;
  return { score: Math.round(score), breakdown, fixes };
}

function parseability(text, fixes) {
  let s = 100;
  if (/\t.+\t.+\t/m.test(text || '')) { s -= 25; fixes.push('Multi-column layout detected (tabs). ATSes mis-parse columns — use single-column flow.'); }
  const weird = ((text || '').match(/[\u{1F000}-\u{1FFFF}\u2600-\u27BF]/gu) || []).length;
  if (weird > 5) { s -= 15; fixes.push('Many emoji/symbol characters detected. Replace decorative icons with plain text.'); }
  if (!text || text.length < 500) { s -= 40; fixes.push('Resume text is very short — if your PDF is image-based, re-export as text PDF.'); }
  return { score: Math.max(0, s) };
}

function keywords(text, jd, fixes) {
  if (!jd) return { score: 50, note: 'No JD pasted — keyword check skipped.' };
  const j = extractSkills(jd), r = extractSkills(text);
  const rs = new Set(r.skills);
  const matched = j.skills.filter(s => rs.has(s));
  const missing = j.skills.filter(s => !rs.has(s));
  const ratio = j.skills.length ? matched.length / j.skills.length : 0.5;
  if (missing.length) fixes.push(`JD mentions skills not in your resume: ${missing.slice(0,8).join(', ')}. Add if you truthfully have them.`);
  return { score: Math.round(ratio * 100), matched, missing };
}

function formatting(text, fixes) {
  let s = 100;
  const sections = ['experience', 'education', 'skills'];
  const missing = sections.filter(sec => !new RegExp(`\\b${sec}\\b`, 'i').test(text || ''));
  if (missing.length) { s -= 15 * missing.length; fixes.push(`Add clearly labeled sections: ${missing.join(', ')}.`); }
  const bullets = ((text || '').match(/^\s*[•\-*–]\s+/gm) || []).length;
  if (bullets < 5) { s -= 10; fixes.push('Use bullet points (•, -, *) to list responsibilities — ATSes parse these reliably.'); }
  const dateA = ((text || '').match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}\b/gi) || []).length;
  const dateB = ((text || '').match(/\b(19|20)\d{2}\s*[-–]\s*(present|(19|20)\d{2})\b/gi) || []).length;
  if (dateA + dateB < 2) { s -= 15; fixes.push('Add clear dates to each role (e.g., "Jan 2020 - Present").'); }
  return { score: Math.max(0, s) };
}

function contact(text, fixes) {
  let s = 0;
  const has = {
    email: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/.test(text || ''),
    phone: /(\+?\d[\d\s\-().]{7,}\d)/.test(text || ''),
    linkedin: /linkedin\.com\/in\//i.test(text || ''),
  };
  if (has.email) s += 50; else fixes.push('Add an email address.');
  if (has.phone) s += 30; else fixes.push('Add a phone number.');
  if (has.linkedin) s += 20; else fixes.push('Add a LinkedIn URL.');
  return { score: s, has };
}

function fileFormat(t, fixes) {
  const scores = { docx: 100, 'pdf-text': 90, txt: 70, 'pdf-image': 10 };
  const s = scores[t] ?? 50;
  if (t === 'pdf-image') fixes.push('Image-based PDF is unreadable by ATSes. Export as text PDF or .docx.');
  return { score: s };
}

function lengthCheck(text, fixes) {
  const words = ((text || '').match(/\b\w+\b/g) || []).length;
  const pages = words / 500;
  if (pages < 0.5) { fixes.push('Resume is very short — aim for ~1 full page minimum.'); return { score: 30, pages: pages.toFixed(1) }; }
  if (pages > 3) { fixes.push('Resume is long (>3 pages). Trim to 1-2 unless you\'re Director+.'); return { score: 40, pages: pages.toFixed(1) }; }
  if (pages > 2.2) return { score: 75, pages: pages.toFixed(1) };
  return { score: 100, pages: pages.toFixed(1) };
}

function actionVerbs(text, fixes) {
  const bullets = (text || '').match(/^\s*[•\-*–]\s+([^\n]+)/gm) || [];
  if (!bullets.length) return { score: 50, strong: 0, total: 0 };
  let strong = 0;
  for (const b of bullets) {
    const first = b.replace(/^\s*[•\-*–]\s+/, '').split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    if (STRONG_VERBS.has(first)) strong++;
  }
  const ratio = strong / bullets.length;
  if (ratio < 0.5) fixes.push('Many bullets don\'t start with strong action verbs. Start with Led / Built / Shipped / Reduced / etc.');
  return { score: Math.round(ratio * 100), strong, total: bullets.length };
}
