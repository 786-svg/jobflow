'use client';
import { useState, useEffect, useMemo } from 'react';
import { ScoreBadge, WorkTypeBadge, SourceBadge, Tag, timeAgo } from './ui';
import { scoreMatch } from '@/lib/scorer';

export default function Feed({ resume, applications, addApplication }) {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('7d');
  const [workTypes, setWorkTypes] = useState({ remote: true, hybrid: true, onsite: true });
  const [sources, setSources] = useState({ remoteok: true, greenhouse: true, lever: true, ashby: true });
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [scoresByJob, setScoresByJob] = useState({});
  const [scoring, setScoring] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/jobs');
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      setAllJobs(data.jobs || []);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  // Score all jobs when resume changes.
  useEffect(() => {
    if (!resume?.text || !allJobs.length) { setScoresByJob({}); return; }
    setScoring(true);
    const scores = {};
    // Yield to UI: do in chunks.
    let i = 0;
    function tick() {
      const end = Math.min(i + 50, allJobs.length);
      for (; i < end; i++) {
        const j = allJobs[i];
        const r = scoreMatch({ text: resume.text, location: resume.location }, j);
        scores[j.id] = r;
      }
      if (i < allJobs.length) setTimeout(tick, 0);
      else { setScoresByJob({ ...scores }); setScoring(false); }
    }
    tick();
  }, [resume, allJobs]);

  const visible = useMemo(() => {
    const limits = { '24h': 86400000, '3d': 259200000, '7d': 604800000, '30d': 2592000000, all: Infinity };
    const lim = limits[dateFilter];
    const q = search.toLowerCase().trim();
    const now = Date.now();
    const result = allJobs.filter(j => {
      if (!sources[j.source]) return false;
      if (!workTypes[j.workType]) return false;
      if (lim !== Infinity && (now - new Date(j.posted_at).getTime()) > lim) return false;
      if (minScore > 0) {
        const sc = scoresByJob[j.id]?.score ?? 0;
        if (sc < minScore) return false;
      }
      if (q) {
        const hay = `${j.title} ${j.company} ${j.location || ''} ${(j.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sortBy === 'score' && Object.keys(scoresByJob).length) {
      result.sort((a, b) => (scoresByJob[b.id]?.score ?? 0) - (scoresByJob[a.id]?.score ?? 0));
    } else {
      result.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));
    }
    return result;
  }, [allJobs, sources, workTypes, dateFilter, search, minScore, sortBy, scoresByJob]);

  const counts = useMemo(() => {
    const c = { remote: 0, hybrid: 0, onsite: 0 };
    for (const j of allJobs) c[j.workType]++;
    return c;
  }, [allJobs]);

  const appliedJobIds = new Set(applications.map(a => a.jobId));

  return (
    <div>
      {/* Filter strip */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 mb-8 items-start">
        <div className="space-y-3">
          <input
            type="search"
            placeholder="Search title, company, skills, or city..."
            className="w-full !border-x-0 !border-t-0 !border-b !border-ink/30 focus:!border-ink !text-2xl !font-display !italic !py-3 !px-0 placeholder:text-ink2/60"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[12px]">
            <FilterGroup label="Type">
              {['remote','hybrid','onsite'].map(t => (
                <FilterChip key={t} label={`${t} (${counts[t]})`} checked={workTypes[t]} onChange={c => setWorkTypes({...workTypes, [t]: c})} />
              ))}
            </FilterGroup>
            <FilterGroup label="Sources">
              {['remoteok','greenhouse','lever','ashby'].map(s => (
                <FilterChip key={s} label={s} checked={sources[s]} onChange={c => setSources({...sources, [s]: c})} />
              ))}
            </FilterGroup>
            <FilterGroup label="Posted">
              <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="!py-1 !text-[12px]">
                <option value="24h">Last 24h</option>
                <option value="3d">Last 3 days</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </FilterGroup>
            {resume?.text && (
              <FilterGroup label="Min fit">
                <select value={minScore} onChange={e => setMinScore(Number(e.target.value))} className="!py-1 !text-[12px]">
                  <option value="0">Any</option>
                  <option value="50">≥ 50</option>
                  <option value="65">≥ 65</option>
                  <option value="75">≥ 75</option>
                  <option value="85">≥ 85</option>
                </select>
              </FilterGroup>
            )}
            {resume?.text && (
              <FilterGroup label="Sort">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="!py-1 !text-[12px]">
                  <option value="newest">Newest</option>
                  <option value="score">Best fit</option>
                </select>
              </FilterGroup>
            )}
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-label text-ink2">
            {loading ? 'Loading...' : `${visible.length.toLocaleString()} / ${allJobs.length.toLocaleString()} listings`}
          </div>
          {scoring && <div className="font-mono text-[10px] text-coral">Scoring against résumé...</div>}
          <button onClick={load} className="btn btn-sm">Refresh</button>
        </div>
      </div>

      {/* Resume nudge */}
      {!resume?.text && (
        <div className="border-[0.5px] border-coral bg-coraldim p-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="font-display italic text-lg text-ink">Add your résumé to unlock fit scoring and tailoring →</div>
        </div>
      )}

      {/* Job list */}
      {error && <div className="empty text-coral">Error: {error}</div>}
      {!loading && !visible.length && <div className="empty py-16">No listings match. Try widening filters.</div>}

      <div className="space-y-0">
        {visible.slice(0, 200).map((j, idx) => {
          const score = scoresByJob[j.id];
          const applied = appliedJobIds.has(j.id);
          return (
            <article
              key={j.id}
              className="card border-b-[0.5px] border-ink/15 py-5 grid grid-cols-[auto_1fr_auto] gap-4 items-start fade-up"
              style={{ animationDelay: `${Math.min(idx * 15, 600)}ms` }}
            >
              <div className="font-mono text-[10px] text-ink2/60 pt-1 tabular-nums">
                {String(idx + 1).padStart(3, '0')}
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-3 flex-wrap mb-1">
                  <WorkTypeBadge type={j.workType} />
                  <span className="font-mono text-[10px] uppercase tracking-label text-ink2/60">·</span>
                  <SourceBadge source={j.source} />
                  <span className="font-mono text-[10px] text-ink2/60">·</span>
                  <span className="font-mono text-[10px] text-ink2">{timeAgo(j.posted_at)} ago</span>
                  {score && <ScoreBadge score={score.score} />}
                  {applied && <span className="font-mono text-[10px] text-leaf">✓ tracked</span>}
                </div>
                <h3 className="font-display text-xl text-ink leading-snug">{j.title}</h3>
                <div className="text-ink2 mt-0.5 text-sm">
                  <span className="italic-display">{j.company}</span>
                  {j.location && <span> &nbsp;·&nbsp; {j.location}</span>}
                </div>
                {j.tags?.length > 0 && (
                  <div className="mt-2">{j.tags.slice(0, 6).map((t, i) => <Tag key={i}>{t}</Tag>)}</div>
                )}
                {score && score.breakdown.skills.matched.length > 0 && (
                  <div className="mt-2 font-mono text-[11px] text-leaf">
                    Match: {score.breakdown.skills.matched.slice(0, 6).join(', ')}
                    {score.breakdown.skills.missing.length > 0 && (
                      <span className="text-ink2/70"> &nbsp;·&nbsp; Missing: {score.breakdown.skills.missing.slice(0, 4).join(', ')}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 items-end">
                <a href={j.apply_url} target="_blank" rel="noopener" className="btn btn-sm btn-primary">Apply →</a>
                <button onClick={() => addApplication(j, 'saved', score?.score)} className="btn btn-sm">Save</button>
                <button onClick={() => addApplication(j, 'applied', score?.score)} className="btn btn-sm btn-coral">Mark applied</button>
              </div>
            </article>
          );
        })}
      </div>

      {visible.length > 200 && (
        <div className="text-center font-mono text-[11px] text-ink2 mt-8">
          Showing first 200 of {visible.length.toLocaleString()}. Narrow with filters above.
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-label text-ink2/60">{label}</span>
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
    </div>
  );
}

function FilterChip({ label, checked, onChange }) {
  return (
    <label className={`cursor-pointer font-mono text-[11px] uppercase tracking-label px-2 py-0.5 border-[0.5px] transition-colors select-none ${checked ? 'border-ink bg-ink text-paper' : 'border-ink/30 text-ink2 hover:border-ink/60'}`}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="hidden" />
      {label}
    </label>
  );
}
