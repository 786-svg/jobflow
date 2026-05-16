'use client';
import { useState } from 'react';

export default function TailorPanel({ resume, apiKey }) {
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function tailor() {
    if (!resume?.text) { setError('Add your résumé first (tab 02).'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const r = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resume.text,
          jobTitle, jobCompany, jobDescription,
          apiKey: apiKey || undefined,
        }),
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="numbered mb-4">03 · Tailor</div>
      <h2 className="font-display text-4xl mb-2">Tailor your <span className="italic-display">résumé</span> for a role.</h2>
      <p className="font-display italic text-ink2 mb-8 max-w-[640px]">Claude rewrites bullets to mirror the job's language — without inventing anything you don't already have. The output is validated to ensure no new skills slip in.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="numbered block mb-2">Job title</label>
            <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full" placeholder="Senior Backend Engineer" />
          </div>
          <div>
            <label className="numbered block mb-2">Company (optional)</label>
            <input value={jobCompany} onChange={e => setJobCompany(e.target.value)} className="w-full" placeholder="Stripe" />
          </div>
          <div>
            <label className="numbered block mb-2">Job description</label>
            <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} className="w-full min-h-[280px] font-mono text-[12px]" placeholder="Paste the full JD here..." />
          </div>
          <button onClick={tailor} className="btn btn-primary" disabled={loading || !jobTitle || !jobDescription}>
            {loading ? 'Tailoring…' : 'Tailor my résumé'}
          </button>
          {error && <p className="text-coral font-mono text-[12px]">{error}</p>}
          {!apiKey && <p className="font-mono text-[11px] text-ink2">No Anthropic key set. Add one in Settings (06) to enable this feature.</p>}
        </div>

        <div className="border-l-[0.5px] border-ink/20 lg:pl-8">
          <div className="numbered mb-4">Result</div>
          {!result && <p className="font-display italic text-ink2">Tailored résumé will appear here.</p>}
          {result && (
            <div className="space-y-6">
              {result._validation && !result._validation.passed && (
                <div className="border-[0.5px] border-coral bg-coraldim p-3 font-mono text-[11px]">
                  ⚠️ Model introduced skills not in original: {result._validation.introduced_skills.join(', ')}. Review carefully.
                </div>
              )}
              {result.summary && (<><div className="numbered">Summary</div><p className="font-display italic text-lg">{result.summary}</p></>)}
              {result.skills_to_highlight && (
                <div>
                  <div className="numbered mb-1">Skills to highlight</div>
                  <p className="font-mono text-[12px]">{result.skills_to_highlight.join(' · ')}</p>
                </div>
              )}
              {result.experience?.map((e, i) => (
                <div key={i}>
                  <div className="font-display italic text-lg">{e.title} · {e.company}</div>
                  <div className="font-mono text-[11px] text-ink2 mb-1">{e.dates}</div>
                  <ul className="space-y-1 text-[14px]">
                    {(e.bullets || []).map((b, j) => <li key={j} className="pl-3 border-l border-ink/20">{b}</li>)}
                  </ul>
                </div>
              ))}
              {result.gaps?.length > 0 && (
                <div>
                  <div className="numbered mb-1 text-coral">Gaps in your résumé vs JD</div>
                  <p className="font-mono text-[12px] text-coral">{result.gaps.join(' · ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
