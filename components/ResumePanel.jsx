'use client';
import { useState } from 'react';
import { extractSkills } from '@/lib/skills';
import { Tag } from './ui';

export default function ResumePanel({ resume, setResume }) {
  const [text, setText] = useState(resume?.text || '');
  const [location, setLocation] = useState(resume?.location || '');
  const skills = text ? extractSkills(text).skills : [];

  function save() {
    setResume({ text, location, skills, savedAt: new Date().toISOString() });
  }
  function clear() {
    setText(''); setLocation('');
    setResume(null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
      <div>
        <div className="numbered mb-4">02 · Résumé</div>
        <h2 className="font-display text-4xl mb-2">Paste your <span className="italic-display">résumé</span>.</h2>
        <p className="font-display italic text-ink2 mb-8">Plain text from your existing doc. Stays on your device — never leaves the browser.</p>

        <label className="block mb-2 font-mono text-[10px] uppercase tracking-label text-ink2">Location (optional)</label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="San Francisco, CA"
          className="w-full mb-6"
        />

        <label className="block mb-2 font-mono text-[10px] uppercase tracking-label text-ink2">Résumé text</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Copy and paste the full text of your résumé here, including experience bullets, education, and skills section..."
          className="w-full min-h-[400px] font-mono text-[13px]"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={save} className="btn btn-primary" disabled={!text.trim()}>Save résumé</button>
          {resume && <button onClick={clear} className="btn">Clear</button>}
        </div>
      </div>

      <aside className="border-l-[0.5px] border-ink/20 pl-8">
        <div className="numbered mb-4">Status</div>
        {resume ? (
          <>
            <p className="font-display text-2xl text-leaf mb-2">Loaded.</p>
            <p className="font-mono text-[11px] text-ink2 mb-6">Saved {new Date(resume.savedAt).toLocaleString()}</p>
            <div className="numbered mb-2">Detected skills ({skills.length})</div>
            <div>{skills.map(s => <Tag key={s}>{s}</Tag>)}</div>
          </>
        ) : (
          <p className="font-display italic text-ink2">No résumé loaded yet. Paste yours to enable fit scoring on every job in the feed.</p>
        )}
      </aside>
    </div>
  );
}
