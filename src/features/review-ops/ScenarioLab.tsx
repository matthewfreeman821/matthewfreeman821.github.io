import { useState } from 'react';
import { scenarios, releaseVerdict, type Assessment, type Classification } from './scenarios';
import './scenario-lab.css';
import ReservationTrace from './ReservationTrace';

const empty = (): Assessment => ({ kind: 'risk', severity: 'medium', rationale: '', evidence: '' });

export default function ScenarioLab() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [selected, setSelected] = useState('C1');
  const [records, setRecords] = useState<Record<string, Record<string, Assessment>>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState('');
  const scenario = scenarios.find(s => s.id === scenarioId)!;
  const decisions = records[scenarioId] ?? {};
  const claim = scenario.claims.find(c => c.id === selected)!;
  const decision = decisions[selected] ?? empty();
  const status = releaseVerdict(scenario.claims, decisions);
  const update = (value: Partial<Assessment>) => setRecords(all => ({ ...all, [scenarioId]: { ...decisions, [selected]: { ...decision, ...value } } }));
  const exportRecord = () => {
    const payload = { schema: 'review-ops/scenario-1', scenario: scenario.id, fictional: true, generatedAt: new Date().toISOString(), status, claims: scenario.claims.map(c => ({ id: c.id, claim: c.claim, decision: decisions[c.id] ?? null })), limitations: ['Human-entered assessments; evidence is not automatically verified.', 'Fictional static fixtures; no AI, GitHub, database, or cache execution.', 'Release verdict applies to this exercise only.'] };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `review-ops-${scenario.id}.json`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Decision record exported.');
  };
  return <div className="review-lab" aria-label="Pull request review lab">
    <div className="lab-heading"><div><span className="lab-label">INTERACTIVE PR REVIEW LAB</span><h3>Would you ship this?</h3><p>Inspect the change. Challenge each reviewer. Own the release decision.</p></div><span className="lab-fiction">FICTIONAL PRs · NO LIVE AI</span></div>
    <div className="lab-scenarios" aria-label="Review scenario">{scenarios.map(s => <button key={s.id} aria-pressed={s.id === scenarioId} onClick={() => { setScenarioId(s.id); setSelected('C1'); setNotice(''); }}>{s.title}</button>)}</div>
    <p className="lab-summary">{scenario.summary}</p>
    <details className="lab-guide"><summary>How to review this change</summary><p>Select each reviewer claim, classify the underlying concern, choose your assessed severity, and record a rationale and an evidence reference. Every claim needs both fields before the verdict becomes complete. Confirmed defects block release at every severity; unresolved risks hold for verification. The reference assessment is optional and never fills in your decisions.</p><p>Your edits remain in this tab’s memory until reload. Export the record to keep them. No data is sent to GitHub or an AI service.</p></details>
    <div className="lab-criteria"><span className="lab-label">ACCEPTANCE CONTRACT</span><ol>{scenario.criteria.map(c => <li key={c}>{c}</li>)}</ol></div>
    <div className="lab-diff" aria-label="Code comparison">{(['before', 'after'] as const).map(side => <div className="lab-code" key={side}><h4>{side.toUpperCase()} <span>{scenario.file}</span></h4><pre tabIndex={0} aria-label={`${side} code`}><code>{scenario[side].map((line, i) => <span className="lab-code-line" key={i}><span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{line}{'\n'}</span>)}</code></pre></div>)}</div>
    <div className="lab-evidence"><span className="lab-label">EVIDENCE DOSSIER / READ BEFORE DECIDING</span>{scenario.evidence.map(e => <details key={e.id}><summary>{e.id} / {e.title}</summary><p>{e.body}</p></details>)}</div>
    {scenarioId === 'reservation' && <ReservationTrace />}
    <div className="lab-workspace"><div className="lab-claims"><span className="lab-label">REVIEWER PERSPECTIVES</span>{scenario.claims.map(c => <button key={c.id} aria-pressed={selected === c.id} onClick={() => setSelected(c.id)}><small>{c.reviewer}</small><strong>{c.title}</strong><span>{decisions[c.id]?.rationale.trim() && decisions[c.id]?.evidence.trim() ? decisions[c.id].kind.toUpperCase() : 'NEEDS DECISION'}</span></button>)}</div>
      <div className="lab-inspector"><span className="lab-label">{claim.id} / {claim.reference}</span><h4>{claim.title}</h4><p>{claim.claim}</p><div className="lab-selects"><label>Classification<select aria-label="Classification" value={decision.kind} onChange={e => update({ kind: e.target.value as Classification })}><option value="defect">Confirmed defect</option><option value="risk">Unverified risk</option><option value="suggestion">Suggestion</option><option value="unsupported">Unsupported finding</option></select></label><label>Assessed severity<select aria-label="Assessed severity" value={decision.severity} onChange={e => update({ severity: e.target.value as Assessment['severity'] })}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option><option value="info">Informational</option></select></label></div>
        <label>Engineering rationale<textarea aria-label="Engineering rationale" value={decision.rationale} onChange={e => update({ rationale: e.target.value })} placeholder="Which acceptance criterion is violated, or why does the claim not hold?" /></label><label>Evidence reference<textarea aria-label="Evidence reference" value={decision.evidence} onChange={e => update({ evidence: e.target.value })} placeholder="Cite a code line, dossier entry, counterexample, or verification still required." /></label>
        <button className="lab-reference" aria-expanded={!!revealed[`${scenarioId}/${selected}`]} onClick={() => setRevealed(r => ({ ...r, [`${scenarioId}/${selected}`]: !r[`${scenarioId}/${selected}`] }))}>Compare with reference assessment</button>{revealed[`${scenarioId}/${selected}`] && <div className="lab-assessment"><strong>REFERENCE / {claim.expected.toUpperCase()}</strong><p>{claim.explanation}</p><p>This is an authored teaching assessment, not an AI result or an automated grade.</p></div>}
      </div>
    </div>
    <div className="lab-verdict" aria-live="polite"><div><span className="lab-label">YOUR RELEASE VERDICT</span><strong>{status.verdict}</strong><p>{status.pending} undocumented · {status.defects} defects · {status.risks} risks. Based on your classifications; evidence quality requires human review.</p></div><button onClick={exportRecord}>Export decision record</button></div><p className="lab-notice" role="status">{notice}</p>
  </div>;
}
