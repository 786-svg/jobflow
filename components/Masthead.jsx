'use client';

export default function Masthead({ tab, setTab }) {
  const tabs = [
    { id: 'feed', label: 'Feed', num: '01' },
    { id: 'resume', label: 'Resume', num: '02' },
    { id: 'tailor', label: 'Tailor', num: '03' },
    { id: 'ats', label: 'ATS Check', num: '04' },
    { id: 'tracker', label: 'Tracker', num: '05' },
    { id: 'settings', label: 'Settings', num: '06' },
  ];
  return (
    <header className="relative">
      {/* Top rule */}
      <div className="border-b-[0.5px] border-ink/20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-label text-ink2">
          <span>Vol. I &nbsp;·&nbsp; № 001</span>
          <span className="flex items-center gap-2">
            <span className="dot-live"></span> Live feed
          </span>
          <span className="hidden sm:inline">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Masthead */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 pt-10 pb-6 border-b-[0.5px] border-ink/20">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="font-display font-light text-[64px] sm:text-[88px] leading-[0.9] tracking-tight">
              The <span className="italic-display">Job</span>flow.
            </h1>
            <p className="font-display italic text-lg sm:text-xl text-ink2 mt-2 max-w-[540px]">
              A quieter way to job hunt. Aggregated from the open web, scored against your résumé, presented without the spam.
            </p>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-label text-ink2 text-right space-y-1">
            <div>Sources · 5</div>
            <div>Companies · 100+</div>
            <div>Refresh · 5 min cache</div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <nav className="border-b-[0.5px] border-ink/20 bg-paperdark/40">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 flex overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-baseline gap-2 px-4 py-3 whitespace-nowrap transition-colors ${tab === t.id ? 'text-ink' : 'text-ink2 hover:text-ink'}`}
            >
              <span className="font-mono text-[10px] tracking-label">{t.num}</span>
              <span className={`font-display text-lg ${tab === t.id ? 'italic-display' : ''}`}>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
