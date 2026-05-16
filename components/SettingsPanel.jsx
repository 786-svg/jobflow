'use client';
import { useState } from 'react';

export default function SettingsPanel({ apiKey, setApiKey, applications, setApplications, resume, setResume }) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [shown, setShown] = useState(false);

  function saveKey() { setApiKey(keyInput.trim() || null); }
  function clearAll() {
    if (!confirm('Erase all local data — résumé, applications, and API key?')) return;
    setApplications([]); setResume(null); setApiKey(null); setKeyInput('');
  }
  function exportData() {
    const blob = new Blob([JSON.stringify({ resume, applications, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'jobflow-export.json'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[720px]">
      <div className="numbered mb-4">06 · Settings</div>
      <h2 className="font-display text-4xl mb-2"><span className="italic-display">Quiet</span> controls.</h2>
      <p className="font-display italic text-ink2 mb-10">Everything in JobFlow is local-first. No accounts, no servers know who you are.</p>

      <section className="border-t-[0.5px] border-ink/20 pt-6 mb-10">
        <h3 className="font-display text-2xl mb-2">Anthropic API key</h3>
        <p className="text-ink2 text-sm mb-4">Needed for résumé tailoring (tab 03). Get one at <a className="linky" target="_blank" rel="noopener" href="https://console.anthropic.com/">console.anthropic.com</a>. Stored only in your browser localStorage — never sent anywhere except directly to Anthropic when you tailor.</p>
        <div className="flex gap-3">
          <input
            type={shown ? 'text' : 'password'}
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            placeholder="sk-ant-..."
            className="flex-1 font-mono text-[12px]"
          />
          <button onClick={() => setShown(!shown)} className="btn btn-sm">{shown ? 'Hide' : 'Show'}</button>
          <button onClick={saveKey} className="btn btn-sm btn-primary">Save</button>
        </div>
        {apiKey && <p className="font-mono text-[11px] text-leaf mt-2">✓ Key saved locally</p>}
      </section>

      <section className="border-t-[0.5px] border-ink/20 pt-6 mb-10">
        <h3 className="font-display text-2xl mb-2">Your data</h3>
        <p className="text-ink2 text-sm mb-4">Résumé: {resume ? `✓ loaded (${resume.skills?.length || 0} skills)` : '— none'} &nbsp;·&nbsp; Tracked applications: {applications.length}</p>
        <div className="flex gap-3 flex-wrap">
          <button onClick={exportData} className="btn btn-sm">Export JSON</button>
          <button onClick={clearAll} className="btn btn-sm btn-coral">Erase everything</button>
        </div>
      </section>

      <section className="border-t-[0.5px] border-ink/20 pt-6 mb-10">
        <h3 className="font-display text-2xl mb-2">Sources</h3>
        <ul className="text-sm space-y-1 text-ink2">
          <li>· <span className="italic-display">RemoteOK</span> — public JSON feed</li>
          <li>· <span className="italic-display">Greenhouse</span> — ~50 popular public boards</li>
          <li>· <span className="italic-display">Lever</span> — ~25 popular public boards</li>
          <li>· <span className="italic-display">Ashby</span> — ~30 popular public boards</li>
        </ul>
        <p className="font-mono text-[11px] text-ink2 mt-3">All sources use officially-documented public endpoints. No scraping. No TOS violations.</p>
      </section>

      <section className="border-t-[0.5px] border-ink/20 pt-6">
        <h3 className="font-display text-2xl mb-2">Philosophy</h3>
        <p className="text-ink2 italic font-display text-lg leading-relaxed">
          LazyApply optimises for volume — 1,000 applications a day, 999 rejections.
          JobFlow optimises for <span className="italic-display">signal</span> — fewer, better-matched applications,
          with a résumé tailored to each.
        </p>
      </section>
    </div>
  );
}
