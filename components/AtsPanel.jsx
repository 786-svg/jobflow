'use client';
import { useState } from 'react';
import { checkAts } from '@/lib/ats';

export default function AtsPanel({ resume }) {
  const [text, setText] = useState(resume?.text || '');
  const [jd, setJd] = useState('');
  const [fileType, setFileType] = useState('pdf-text');
  const [result, setResult] = useState(null);

  function run() {
    if (!text.trim()) return;
    setResult(checkAts({ text, fileType }, jd));
  }

  return (
    <div>
      <div className="numbered mb-4">04 · ATS Check</div>
      <h2 className="font-display text-4xl mb-2">Score your résumé <span className="italic-display">against the bots</span>.</h2>
      <p className="font-display italic text-ink2 mb-8 max-w-[640px]">Seven-factor check emulating how Workday, Greenhouse, iCIMS, and the rest parse and rank résumés. Specific fixes, no fluff.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="numbered block mb-2">Résumé text</label>
            <textarea value={text} onChange={e => setText(e.target.value)} className="w-full min-h-[200px] font-mono text-[12px]" placeholder="Paste résumé text..." />
          </div>
          <div>
            <label className="numbered block mb-2">Job description (optional, enables keyword check)</label>
            <textarea value={jd} onChange={e => setJd(e.target.value)} className="w-full min-h-[120px] font-mono text-[12px]" />
          </div>
          <div>
            <label className="numbered block mb-2">File type</label>
            <select value={fileType} onChange={e => setFileType(e.target.value)}>
              <option value="docx">DOCX</option>
              <option value="pdf-text">PDF (text-based)</option>
              <option value="pdf-image">PDF (image / scanned)</option>
              <option value="txt">Plain text</option>
            </select>
          </div>
          <button onClick={run} className="btn btn-primary" disabled={!text.trim()}>Check ATS compatibility</button>
        </div>

        <div className="border-l-[0.5px] border-ink/20 lg:pl-8">
          <div className="numbered mb-4">Score</div>
          {!result && <p className="font-display italic text-ink2">Run a check to see results.</p>}
          {result && (
            <>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-7xl leading-none">{result.score}</span>
                <span className="font-mono text-[12px] text-ink2">/ 100</span>
              </div>
              <div className="space-y-3 mb-8">
                {Object.entries(result.breakdown).map(([k, v]) => (
                  <div key={k}>
                    <div className="flex justify-between font-mono text-[11px] mb-1">
                      <span className="uppercase tracking-label text-ink2">{k}</span>
                      <span className="tabular-nums">{v.score}</span>
                    </div>
                    <div className="h-[2px] bg-rulesoft">
                      <div className={`h-full ${v.score >= 75 ? 'bg-leaf' : v.score >= 50 ? 'bg-amber' : 'bg-coral'}`} style={{ width: `${v.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              {result.fixes.length > 0 && (
                <>
                  <div className="numbered mb-2 text-coral">Fixes</div>
                  <ul className="space-y-2 text-[14px]">
                    {result.fixes.map((f, i) => <li key={i} className="pl-3 border-l-2 border-coral">{f}</li>)}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
