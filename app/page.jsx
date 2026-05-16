'use client';
import { useState } from 'react';
import { useLocal } from '@/components/ui';
import Masthead from '@/components/Masthead';
import Feed from '@/components/Feed';
import ResumePanel from '@/components/ResumePanel';
import TailorPanel from '@/components/TailorPanel';
import AtsPanel from '@/components/AtsPanel';
import TrackerPanel from '@/components/TrackerPanel';
import SettingsPanel from '@/components/SettingsPanel';

export default function HomePage() {
  const [tab, setTab] = useState('feed');
  const [resume, setResume] = useLocal('jobflow.resume', null);
  const [applications, setApplications] = useLocal('jobflow.applications', []);
  const [apiKey, setApiKey] = useLocal('jobflow.apiKey', null);

  function addApplication(job, status, fitScore) {
    const existing = applications.find(a => a.jobId === job.id);
    if (existing) {
      setApplications(applications.map(a => a.jobId === job.id ? { ...a, status, updatedAt: Date.now() } : a));
      return;
    }
    setApplications([
      ...applications,
      {
        id: 'app-' + Math.random().toString(36).slice(2, 9),
        jobId: job.id,
        title: job.title,
        company: job.company,
        apply_url: job.apply_url,
        source: job.source,
        status,
        fitScore,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);
  }

  return (
    <div className="relative">
      <Masthead tab={tab} setTab={setTab} />
      <main className="max-w-[1200px] mx-auto px-6 lg:px-10 py-10 relative">
        {tab === 'feed' && <Feed resume={resume} applications={applications} addApplication={addApplication} />}
        {tab === 'resume' && <ResumePanel resume={resume} setResume={setResume} />}
        {tab === 'tailor' && <TailorPanel resume={resume} apiKey={apiKey} />}
        {tab === 'ats' && <AtsPanel resume={resume} />}
        {tab === 'tracker' && <TrackerPanel applications={applications} setApplications={setApplications} />}
        {tab === 'settings' && (
          <SettingsPanel
            apiKey={apiKey} setApiKey={setApiKey}
            applications={applications} setApplications={setApplications}
            resume={resume} setResume={setResume}
          />
        )}
      </main>
      <footer className="border-t-[0.5px] border-ink/20 mt-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8 flex justify-between items-baseline gap-4 flex-wrap">
          <div className="font-display italic text-lg">JobFlow — <span className="font-sans not-italic text-sm text-ink2">quality over quantity</span></div>
          <div className="font-mono text-[10px] uppercase tracking-label text-ink2">Built with Claude · No tracking · Local-first</div>
        </div>
      </footer>
    </div>
  );
}
