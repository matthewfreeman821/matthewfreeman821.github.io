import { useState } from 'react';

type Verdict = 'accept' | 'dismiss' | 'investigate';
type Finding = { id: string; agent: string; line: number; severity: string; title: string; claim: string; evidence: string; material: boolean };
type ReviewCase = { id: string; title: string; description: string; before: string[]; after: string[]; criteria: string[]; tests: string[]; findings: Finding[] };

const cases: ReviewCase[] = [
  {
    id: 'PR-1042', title: 'Concurrent inventory reservation', description: 'Fictional service change. A new request key prevents sequential duplicate orders, but the stock update may still race.',
    before: ['async function reserve(partId, qty) {', '  const part = await db.parts.find(partId);', '  if (part.stock < qty) throw Error("Insufficient");', '  await db.parts.update(partId, {stock: part.stock - qty});', '  return {reserved: qty};', '}'],
    after: ['async function reserve(partId, qty, key) {', '  const previous = await db.requests.find(key);', '  if (previous) return previous.result;', '  const part = await db.parts.find(partId);', '  if (part.stock < qty) throw Error("Insufficient");', '  await db.parts.update(partId, {stock: part.stock - qty});', '  return db.requests.save(key, {reserved: qty});', '}'],
    criteria: ['Concurrent requests must not reserve the same final unit.', 'Insufficient stock must not modify inventory.', 'A repeated request key must not reserve inventory twice.'],
    tests: ['PASS  / single reservation', 'PASS  / sequential insufficient-stock response', 'FAIL  / two concurrent requests reserve final unit', 'NOT RUN  / simultaneous duplicate-key requests'],
    findings: [
      { id: 'a', agent: 'CORRECTNESS', line: 6, severity: 'CRITICAL', title: 'Lost update under concurrency', claim: 'Read-then-write stock update is non-atomic. Two callers may both read the final unit.', evidence: 'The concurrent last-unit fixture reproduces the issue. Use a transactional conditional update or equivalent locking.', material: true },
      { id: 'b', agent: 'SECURITY', line: 1, severity: 'MEDIUM', title: 'Missing permission guard', claim: 'The function has no explicit caller-authorization check.', evidence: 'The fictional route middleware already enforces the permission before this service is reached; the diff does not establish a vulnerability.', material: false },
      { id: 'c', agent: 'MAINTAINABILITY', line: 2, severity: 'LOW', title: 'Extract a helper method', claim: 'Move the prior-request lookup into a separate helper.', evidence: 'No project convention, failure, or complexity argument supports making this a blocking change.', material: false }
    ]
  },
  {
    id: 'PR-1043', title: 'Identity-provider logout', description: 'A provider SDK replaces local-only cleanup with the supported logout API. All fictional acceptance tests pass.',
    before: ['function logout() {', '  localStorage.clear();', '  window.location.assign("/");', '}'],
    after: ['async function logout(auth) {', '  await auth.signOut({', '    postLogoutRedirectUri: config.logoutRedirect', '  });', '}'],
    criteria: ['Call the configured provider logout method.', 'Use the exact allowlisted post-logout URI.', 'Do not expose credentials or tokens in logs.'],
    tests: ['PASS  / provider method invoked', 'PASS  / redirect allowlist exact match', 'PASS  / no tokens written to log', 'PASS  / fictional cross-account fixture'],
    findings: [
      { id: 'a', agent: 'CORRECTNESS', line: 2, severity: 'LOW', title: 'Remove the await', claim: 'Awaiting signOut adds no value.', evidence: 'The SDK returns a promise and awaiting it is appropriate for the caller contract. No defect is demonstrated.', material: false },
      { id: 'b', agent: 'SECURITY', line: 3, severity: 'HIGH', title: 'Untrusted redirect', claim: 'The logout URI could enable an open redirect.', evidence: 'The URI is fixed configuration and the fictional fixture verifies it is registered with the provider.', material: false },
      { id: 'c', agent: 'MAINTAINABILITY', line: 1, severity: 'LOW', title: 'Rename logout', claim: 'Rename the public API to providerLogout.', evidence: 'The external contract already uses logout. This is an unsupported style preference.', material: false }
    ]
  }
];

export default function CodeReviewArena() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [tab, setTab] = useState<'diff' | 'tests' | 'contract'>('diff');
  const [selected, setSelected] = useState('a');
  const [decisions, setDecisions] = useState<Record<string, Verdict>>({});
  const [showReport, setShowReport] = useState(false);
  const review = cases[caseIndex];
  const current = review.findings.find(f => f.id === selected) || review.findings[0];
  const resolved = review.findings.filter(f => decisions[f.id] === 'accept' || decisions[f.id] === 'dismiss').length;
  const right = review.findings.filter(f => (f.material && decisions[f.id] === 'accept') || (!f.material && decisions[f.id] === 'dismiss')).length;
  const misses = review.findings.filter(f => f.material && decisions[f.id] !== 'accept').length;
  const falsePositives = review.findings.filter(f => !f.material && decisions[f.id] === 'accept').length;
  const chooseCase = (index: number) => { setCaseIndex(index); setTab('diff'); setSelected('a'); setDecisions({}); setShowReport(false); };
  const decide = (v: Verdict) => { setDecisions(old => ({ ...old, [current.id]: v })); setShowReport(false); if (v === 'investigate') setTab('tests'); };

  return <section id="code-review-arena" className="cra">
    <style>{`
      .cra{--c:#72e4f0;--l:#30475b;background:#090f19;color:#eaf4fa;padding:80px max(20px,calc((100% - 1180px)/2));border-top:1px solid var(--l);font-family:ui-monospace,Consolas,monospace}
      .cra *{box-sizing:border-box}.cra button{font:inherit;cursor:pointer;border-radius:0}.cra button:focus-visible{outline:2px solid var(--c);outline-offset:3px}
      .cra-kicker{display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid var(--l);padding-bottom:17px;color:var(--c);font-size:10px;letter-spacing:1.7px}
      .cra h2{font-size:clamp(40px,6.5vw,78px);letter-spacing:-4px;line-height:1.05;margin:36px 0 16px}.cra h2 span{color:var(--c)}
      .cra-intro{max-width:830px;font:15px/1.8 system-ui,sans-serif;color:#abc1d0}
      .cra-scenarios{display:flex;flex-wrap:wrap;gap:8px;margin:30px 0 16px}.cra-scenarios button{background:#102232;border:1px solid var(--l);color:#c6dbe7;padding:14px 17px;font-size:11px;text-align:left}.cra-scenarios button[aria-pressed=true]{border-color:var(--c);background:#1b3a4b;color:var(--c)}
      .cra-brief{background:#10202f;border:1px solid var(--l);border-left:3px solid var(--c);padding:17px 22px}.cra-brief strong{font-size:15px}.cra-brief p{font:13px/1.7 system-ui,sans-serif;color:#adc4d1;margin-bottom:0}
      .cra-layout{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(300px,.85fr);gap:1px;margin-top:15px;background:var(--l);border:1px solid var(--l)}.cra-pane{min-width:0;background:#0d1926}
      .cra-title{padding:16px 18px;border-bottom:1px solid var(--l);color:var(--c);font-size:10px;letter-spacing:1.3px;display:flex;justify-content:space-between;gap:10px}
      .cra-tabs{display:flex}.cra-tabs button{flex:1;padding:14px 5px;background:#102030;border:0;border-bottom:1px solid var(--l);border-right:1px solid var(--l);color:#92b0c0;font-size:10px}.cra-tabs button[aria-pressed=true]{background:#214356;color:var(--c)}
      .cra-diff{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--l);min-width:660px}.cra-scroll{overflow:auto;min-height:340px}.cra-col{background:#101c2a}.cra-col-title{padding:12px;font-size:10px;color:#95aebe;border-bottom:1px solid var(--l)}.cra-line{display:flex;gap:12px;padding:7px 12px;min-height:30px;font-size:11px;white-space:pre}.cra-line code{font:inherit}.cra-num{min-width:20px;color:#7891a2}.cra-before{background:#291e2b;color:#ffb7b6}.cra-after{background:#14332f;color:#ace8d1}
      .cra-evidence{min-height:340px;padding:22px}.cra-test{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid var(--l);padding:14px 0;font-size:11px;color:#c6d8e5}.cra-test em{font-style:normal;color:var(--c);text-align:right}.cra-evidence li{font:13px/1.7 system-ui,sans-serif;margin:15px 0;color:#c0d6e2}
      .cra-reviews{padding:16px}.cra-review{display:block;width:100%;padding:15px;text-align:left;background:#122637;border:1px solid var(--l);color:#e0eef7;margin-bottom:8px}.cra-review[aria-pressed=true]{border-color:var(--c);background:#1b3b4e}.cra-review small{display:block;color:var(--c);font-size:10px;margin-bottom:9px}.cra-review strong{font-size:12px}.cra-review em{display:block;font-style:normal;color:#9eb7c8;font-size:10px;margin-top:9px}
      .cra-inspector{border-top:1px solid var(--l);padding:18px}.cra-inspector h3{font-size:17px;line-height:1.3}.cra-inspector p{font:12px/1.75 system-ui,sans-serif;color:#adc4d3}.cra-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:18px}.cra-actions button{border:1px solid #3e6177;background:#102b3d;color:#d5e7ef;padding:12px 7px;font-size:10px}.cra-actions button[aria-pressed=true]{background:#20566a;border-color:var(--c)}
      .cra-gate{border:1px solid var(--l);border-top:0;background:#102332;padding:23px;display:flex;align-items:center;justify-content:space-between;gap:18px}.cra-gate strong{font-size:12px}.cra-gate p{font:12px/1.6 system-ui,sans-serif;color:#99b3c2}.cra-go{border:1px solid var(--c);background:var(--c);color:#07131b;padding:15px 20px;font-size:11px;font-weight:700;white-space:nowrap}.cra-go:disabled{opacity:.4;cursor:not-allowed}
      .cra-result{border:1px solid #426f83;border-top:0;background:#102b3d;padding:24px}.cra-result h3{font-size:22px}.cra-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.cra-metric{border:1px solid var(--l);padding:15px}.cra-metric strong{display:block;font-size:26px}.cra-metric small{font-size:10px;color:#9eb8ca}.cra-result p{font:12px/1.7 system-ui,sans-serif;color:#bbd3df;border-top:1px solid var(--l);padding-top:12px}
      .cra-disclaimer{font-size:10px;color:#819baa;margin-top:22px;line-height:1.8}
      @media(max-width:850px){.cra-layout{grid-template-columns:1fr}.cra-gate{flex-direction:column;align-items:flex-start}.cra h2{letter-spacing:-2px}}
      @media(max-width:500px){.cra{padding:55px 16px}.cra-actions{grid-template-columns:1fr}.cra-metrics{grid-template-columns:1fr}.cra-scenarios button{width:100%}}
      @media(prefers-reduced-motion:reduce){.cra *{animation:none!important;transition:none!important}}
    `}</style>
    <div className="cra-kicker"><span>05 / ENGINEERING COMMAND CENTER</span><span>SYNTHETIC PULL REQUEST LAB</span></div>
    <h2>REVIEW THE <span>REVIEWERS.</span></h2>
    <p className="cra-intro">Three simulated AI reviewers, competing claims, and a real engineering decision. Inspect the change, compare findings with evidence, then determine whether this PR needs changes—or is ready to approve.</p>
    <div className="cra-scenarios" aria-label="Choose a pull request">{cases.map((c,i) => <button key={c.id} onClick={() => chooseCase(i)} aria-pressed={i === caseIndex}>{c.id} / {c.title}</button>)}</div>
    <div className="cra-brief"><strong>{review.id} / {review.title}</strong><p>{review.description}</p></div>
    <div className="cra-layout">
      <div className="cra-pane">
        <div className="cra-title"><span>01 / EVIDENCE WORKSPACE</span><span>READ-ONLY DIFF</span></div>
        <div className="cra-tabs">{(['diff','tests','contract'] as const).map(t => <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t}>{t === 'diff' ? 'CODE DIFF' : t === 'tests' ? 'TEST RESULTS' : 'ACCEPTANCE CRITERIA'}</button>)}</div>
        {tab === 'diff' ? <div className="cra-scroll"><div className="cra-diff"><div className="cra-col"><div className="cra-col-title">BEFORE / REMOVED</div>{review.before.map((line,i) => <div className="cra-line cra-before" key={i}><span className="cra-num">{i+1}</span><code>{line}</code></div>)}</div><div className="cra-col"><div className="cra-col-title">AFTER / PROPOSED</div>{review.after.map((line,i) => <div className="cra-line cra-after" key={i}><span className="cra-num">{i+1}</span><code>{line}</code></div>)}</div></div></div> : tab === 'tests' ? <div className="cra-evidence">{review.tests.map(t => <div className="cra-test" key={t}><span>{t.split('/')[1] || t}</span><em>{t.split('/')[0]}</em></div>)}</div> : <div className="cra-evidence"><ol>{review.criteria.map(c => <li key={c}>{c}</li>)}</ol></div>}
      </div>
      <div className="cra-pane">
        <div className="cra-title"><span>02 / AI REVIEW REPORTS</span><span>{resolved}/3 CLOSED</span></div>
        <div className="cra-reviews">{review.findings.map(f => <button className="cra-review" key={f.id} aria-pressed={selected === f.id} onClick={() => setSelected(f.id)}><small>{f.agent} / {f.severity} / LINE {f.line}</small><strong>{f.title}</strong><em>{decisions[f.id] ? decisions[f.id].toUpperCase() : 'AWAITING DISPOSITION'}</em></button>)}</div>
        <div className="cra-inspector"><div className="cra-title" style={{padding:'0 0 12px',border:0}}>03 / FINDING INSPECTOR</div><h3>{current.title}</h3><p>{current.claim}</p><p><strong>Evidence:</strong> {current.evidence}</p><div className="cra-actions"><button aria-pressed={decisions[current.id] === 'accept'} onClick={() => decide('accept')}>ACCEPT</button><button aria-pressed={decisions[current.id] === 'dismiss'} onClick={() => decide('dismiss')}>DISMISS</button><button aria-pressed={decisions[current.id] === 'investigate'} onClick={() => decide('investigate')}>INVESTIGATE</button></div></div>
      </div>
    </div>
    <div className="cra-gate"><div><strong>HUMAN REVIEW GATE / {resolved} OF 3 FINDINGS RESOLVED</strong><p>Inspect the evidence, then accept or dismiss all findings. Investigate opens test results for further context. A clean PR can be approved without change requests.</p></div><button className="cra-go" disabled={resolved !== 3} onClick={() => setShowReport(true)}>GENERATE REVIEW REPORT →</button></div>
    {showReport && <div className="cra-result" role="status"><div className="cra-title" style={{padding:'0 0 12px',border:0}}>04 / EVALUATION</div><h3>{right === 3 ? 'EVIDENCE-ALIGNED REVIEW' : 'REVIEW REQUIRES CALIBRATION'}</h3><div className="cra-metrics"><div className="cra-metric"><strong>{right}/3</strong><small>SUPPORTED DECISIONS</small></div><div className="cra-metric"><strong>{misses}</strong><small>MISSED DEFECTS</small></div><div className="cra-metric"><strong>{falsePositives}</strong><small>FALSE POSITIVES ACCEPTED</small></div></div>{review.findings.map(f => <p key={f.id}><strong>{f.agent}: {f.material ? 'MATERIAL FINDING' : 'UNSUPPORTED FINDING'}.</strong> {f.evidence} You chose: {decisions[f.id]}.</p>)}<button className="cra-go" onClick={() => chooseCase(caseIndex)}>RESET THIS REVIEW ↺</button></div>}
    <div className="cra-disclaimer">FICTIONAL CODE + TEST FIXTURES / DETERMINISTIC REVIEW SCORING / NO REAL AI AGENTS OR EXECUTED TESTS / NO API COSTS</div>
  </section>;
}
