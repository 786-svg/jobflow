'use client';
import { useState, useEffect } from 'react';

export function ScoreBadge({ score }) {
  if (score == null) return null;
  const cls = score >= 75 ? 'bg-leafdim text-leaf' :
              score >= 55 ? 'bg-amberdim text-amber' :
              'bg-coraldim text-coral';
  return (
    <span className={`font-mono text-[11px] font-medium px-2 py-0.5 rounded-sm ${cls}`}>
      {score}
    </span>
  );
}

export function WorkTypeBadge({ type }) {
  const colors = {
    remote: 'bg-leafdim text-leaf',
    hybrid: 'bg-amberdim text-amber',
    onsite: 'bg-rulesoft text-ink2',
  };
  return (
    <span className={`font-mono text-[10px] uppercase tracking-label px-1.5 py-0.5 ${colors[type] || colors.onsite}`}>
      {type}
    </span>
  );
}

export function SourceBadge({ source }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-label text-ink2">
      {source}
    </span>
  );
}

export function Tag({ children }) {
  return (
    <span className="inline-block text-[11px] font-mono text-ink2 mr-2 mb-1">
      {children}
    </span>
  );
}

export function timeAgo(d) {
  if (!d) return '';
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 3600) return Math.round(s / 60) + 'm';
  if (s < 86400) return Math.round(s / 3600) + 'h';
  if (s < 604800) return Math.round(s / 86400) + 'd';
  return Math.round(s / 604800) + 'w';
}

export function useLocal(key, initial) {
  const [v, setV] = useState(initial);
  useEffect(() => {
    try { const s = localStorage.getItem(key); if (s) setV(JSON.parse(s)); } catch {}
  }, [key]);
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key, v]);
  return [v, setV];
}
