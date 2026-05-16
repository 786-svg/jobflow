'use client';
import { useMemo } from 'react';
import { ScoreBadge, timeAgo } from './ui';

const COLS = [
  { id: 'saved', label: 'Saved', num: '01' },
  { id: 'applied', label: 'Applied', num: '02' },
  { id: 'screening', label: 'Screening', num: '03' },
  { id: 'interview', label: 'Interview', num: '04' },
  { id: 'offer', label: 'Offer', num: '05' },
  { id: 'rejected', label: 'Rejected', num: '06' },
];

export default function TrackerPanel({ applications, setApplications }) {
  const grouped = useMemo(() => {
    const g = Object.fromEntries(COLS.map(c => [c.id, []]));
    for (const a of applications) (g[a.status] = g[a.status] || []).push(a);
    return g;
  }, [applications]);

  function move(app, status) {
    setApplications(applications.map(a => a.id === app.id ? { ...a, status, updatedAt: Date.now() } : a));
  }
  function remove(app) {
    setApplications(applications.filter(a => a.id !== app.id));
  }

  const total = applications.length;
  const funnel = COLS.map(c => ({ ...c, n: grouped[c.id]?.length || 0 }));

  return (
    <div>
      <div className="numbered mb-4">05 · Tracker</div>
      <h2 className="font-display text-4xl mb-2">Your <span className="italic-display">funnel</span>.</h2>
      <p className="font-display italic text-ink2 mb-8 max-w-[640px]">Saved roles, applications sent, and what came back. Stored locally — yours alone.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10 border-y-[0.5px] border-ink/20 py-6">
        {funnel.map(c => (
          <div key={c.id}>
            <div className="font-mono text-[10px] uppercase tracking-label text-ink2">{c.num} · {c.label}</div>
            <div className="font-display text-5xl">{c.n}</div>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <p className="font-display italic text-ink2">Nothing tracked yet. Save or mark applied from the feed.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
          {COLS.map(col => (
            <section key={col.id}>
              <div className="border-b-[0.5px] border-ink/30 pb-2 mb-3 flex items-baseline justify-between">
                <h3 className="font-display italic text-2xl">{col.label}</h3>
                <span className="font-mono text-[11px] text-ink2 tabular-nums">{grouped[col.id]?.length || 0}</span>
              </div>
              <div className="space-y-3">
                {(grouped[col.id] || []).map(a => (
                  <article key={a.id} className="border-[0.5px] border-ink/15 p-3">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="font-display text-base leading-tight">{a.title}</h4>
                      {a.fitScore != null && <ScoreBadge score={a.fitScore} />}
                    </div>
                    <div className="font-mono text-[11px] text-ink2 mb-2">{a.company} · {timeAgo(a.updatedAt)} ago</div>
                    <div className="flex gap-1 flex-wrap">
                      <a href={a.apply_url} target="_blank" rel="noopener" className="btn btn-sm">Open</a>
                      <select
                        value={a.status}
                        onChange={e => move(a, e.target.value)}
                        className="!py-1 !px-2 !text-[10px] !font-mono !uppercase !tracking-label"
                      >
                        {COLS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                      <button onClick={() => remove(a)} className="btn btn-sm">×</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
