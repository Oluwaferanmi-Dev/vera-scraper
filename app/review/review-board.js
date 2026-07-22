'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';

const REVIEW_STATES = ['pending_review', 'approved', 'rejected', 'archived'];
const LABELS = { pending_review: 'To review', approved: 'Approved', rejected: 'Rejected', archived: 'Archived' };

function displayDate(value, fallback) {
  if (!value) return fallback || 'Date not supplied';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? fallback || value : new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function CandidateCard({ candidate, onReview, pending }) {
  return (
    <article className="candidate-card">
      <div className="card-kicker"><span>{candidate.source_name}</span><time>{displayDate(candidate.starts_at, candidate.date_text)}</time></div>
      <h2>{candidate.title}</h2>
      {candidate.location_text ? <p className="location">⌖ {candidate.location_text}</p> : null}
      {candidate.description ? <p className="description">{candidate.description}</p> : <p className="description muted">No description supplied by source.</p>}
      <div className="card-footer">
        <a href={candidate.source_url} target="_blank" rel="noreferrer">Open source ↗</a>
        {candidate.review_status === 'pending_review' ? (
          <div className="actions">
            <button className="reject" disabled={pending} onClick={() => onReview(candidate.id, 'rejected')}>Reject</button>
            <button className="approve" disabled={pending} onClick={() => onReview(candidate.id, 'approved')}>Approve</button>
          </div>
        ) : <span className={`status ${candidate.review_status}`}>{LABELS[candidate.review_status]}</span>}
      </div>
    </article>
  );
}

export function ReviewBoard({ reviewerEmail }) {
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter] = useState('pending_review');
  const [notice, setNotice] = useState('');
  const [isPending, startTransition] = useTransition();

  const load = useCallback(async () => {
    const response = await fetch('/api/candidates', { cache: 'no-store' });
    const payload = await response.json();
    if (response.ok) setCandidates(payload.candidates);
    else setNotice(payload.error || 'Could not load the queue.');
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => candidates.reduce((map, candidate) => ({ ...map, [candidate.review_status]: (map[candidate.review_status] || 0) + 1 }), {}), [candidates]);
  const visibleCandidates = candidates.filter((candidate) => candidate.review_status === filter);

  function review(id, reviewStatus) {
    startTransition(async () => {
      setNotice('');
      const response = await fetch('/api/candidates', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, reviewStatus }) });
      const payload = await response.json();
      if (!response.ok) { setNotice(payload.error || 'Could not save that review.'); return; }
      setCandidates((items) => items.map((item) => item.id === id ? payload.candidate : item));
    });
  }

  return (
    <main className="desk-shell">
      <header className="desk-header">
        <div><p className="eyebrow">VERA / EVENT CANDIDATES</p><h1>The Review Desk</h1></div>
        <div className="reviewer">Signed in as <strong>{reviewerEmail}</strong></div>
      </header>
      <section className="intro"><p>Fresh discoveries from trusted sources. Nothing moves to the live platform unless you decide it belongs.</p><span>✦ HUMAN-CURATED</span></section>
      <nav className="filters" aria-label="Candidate status">
        {REVIEW_STATES.map((state) => <button key={state} className={filter === state ? 'active' : ''} onClick={() => setFilter(state)}>{LABELS[state]} <b>{counts[state] || 0}</b></button>)}
      </nav>
      {notice ? <p className="notice">{notice}</p> : null}
      <section className="candidate-grid" aria-live="polite">
        {visibleCandidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} pending={isPending} onReview={review} />)}
        {!visibleCandidates.length ? <div className="empty"><span>◌</span><h2>No {LABELS[filter].toLowerCase()} candidates.</h2><p>Check back after the next scheduled scan.</p></div> : null}
      </section>
    </main>
  );
}
