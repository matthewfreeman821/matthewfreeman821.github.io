import { useMemo, useState } from 'react';

type Strategy = 'none' | 'local' | 'identity';
type Finding = 'none' | 'accept' | 'reject';
type TestMode = 'none' | 'ui' | 'integration';
type EvidenceKey = 'browser' | 'server' | 'redirect';

const evidence: { id: EvidenceKey; name: string; signal: string; detail: string }[] = [
  { id: 'browser', name: 'BROWSER TRACE', signal: 'Local tokens cleared', detail: 'The frontend removes local tokens, but a user can still authenticate without entering credentials. Local cleanup is not proof of a terminated identity-provider session.' },
  { id: 'server', name: 'IDENTITY SESSION', signal: 'Remote session persists', detail: 'A successful application logout does not establish that the identity provider ended its browser session. The session boundary must be tested independently.' },
  { id: 'redirect', name: 'LOGOUT RESPONSE', signal: 'Redirect rejected', detail: 'The logout response indicates a redirect or token-hint configuration problem. Investigate the exact allowed URI and provider-specific requirements before designing the fix.' }
];

const agentNames = [
  { id: 'planner', name: 'PLANNER', role: 'Scope + constraints' },
  { id: 'architect', name: 'ARCHITECT', role: 'Session boundaries' },
  { id: 'implementer', name: 'IMPLEMENTER', role: 'Targeted proposal' },
  { id: 'reviewer', name: 'REVIEWER', role: 'Threats + assumptions' },
  { id: 'validator', name: 'VALIDATOR', role: 'Behavioral proof' }
];

const artifactText = (strategy: Strategy, finding: Finding, test: TestMode) => [
  { title: '01 / TASK CONTRACT', agent: 'PLANNER', content: 'Acceptance criteria: sign out the current account, prevent unintended account reuse, allow a different account to sign in, and preserve supported provider behavior. No client credentials or private code required.' },
  { title: '02 / ARCHITECTURE DECISION', agent: 'ARCHITECT', content: strategy === 'identity' ? 'Selected: provider-aware logout flow. Verify session termination, redirect allowlisting, token hints, and backend/frontend responsibility. Exact implementation depends on the configured identity provider.' : strategy === 'local' ? 'Selected: clear browser storage only. This does not address a persistent identity-provider session and fails the primary acceptance criterion.' : 'Pending: choose whether the session boundary or only local browser state should be addressed.' },
  { title: '03 / REVIEW FINDING', agent: 'REVIEWER', content: finding === 'accept' ? 'Material concern accepted: local state cleanup does not prove remote session termination. Require the provider-side behavior to be verified.' : finding === 'reject' ? 'Material concern dismissed without resolving evidence. Review coverage is inadequate.' : 'Pending: decide whether the reviewer finding is substantiated.' },
  { title: '04 / VERIFICATION PLAN', agent: 'VALIDATOR', content: test === 'integration' ? 'Selected: cross-account incognito flow, identity-provider session termination, configured logout redirect, and reauthentication behavior. This is a simulated plan, not an executed test run.' : test === 'ui' ? 'Selected: frontend sign-out checks only. These cannot establish identity-provider session termination.' : 'Pending: verification scope has not been selected.' }
];

export default function MissionControl() {
  const [examined, setExamined] = useState<EvidenceKey[]>([]);
  const [strategy, setStrategy] = useState<Strategy>('none');
  const [finding, setFinding] = useState<Finding>('none');
  const [test, setTest] = useState<TestMode>('none');
  const [activeEvidence, setActiveEvidence] = useState<EvidenceKey>('browser');
  const [activeArtifact, setActiveArtifact] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const enoughEvidence = examined.includes('browser') && examined.includes('server');
  const ready = strategy !== 'none' && finding !== 'none' && test !== 'none';
  const verified = strategy === 'identity' && finding === 'accept' && test === 'integration' && enoughEvidence;
  const decisions = [strategy !== 'none', finding !== 'none', test !== 'none'];
  const riskCount = (strategy === 'local' ? 2 : 0) + (finding === 'reject' ? 1 : 0) + (test === 'ui' ? 1 : 0) + (!enoughEvidence ? 1 : 0);
  const score = Math.max(0, Math.min(100, (examined.length * 10) + (strategy === 'identity' ? 30 : 0) + (finding === 'accept' ? 20 : 0) + (test === 'integration' ? 20 : 0)));
  const artifacts = useMemo(() => artifactText(strategy, finding, test), [strategy, finding, test]);
  const traces = [
    'Mission accepted / account-switch defect',
    ...examined.map(id => `Evidence inspected / ${evidence.find(e => e.id === id)?.name}`),
    ...(strategy !== 'none' ? [`Architecture selected / ${strategy === 'identity' ? 'provider-aware sign-out' : 'local-only cleanup'}`] : []),
    ...(finding !== 'none' ? [`Review disposition / ${finding === 'accept' ? 'material finding accepted' : 'finding dismissed'}`] : []),
    ...(test !== 'none' ? [`Verification scope / ${test === 'integration' ? 'cross-account integration' : 'UI-only'}`] : []),
    ...(showResult ? [`Gate result / ${verified ? 'eligible for implementation, not proven' : 'engineering risks unresolved'}`] : [])
  ];
  const selectEvidence = (id: EvidenceKey) => {
    setActiveEvidence(id);
    setExamined(old => old.includes(id) ? old : [...old, id]);
    setShowResult(false);
  };
  const reset = () => {setExamined([]); setStrategy('none'); setFinding('none'); setTest('none'); setActiveEvidence('browser'); setActiveArtifact(0); setShowResult(false);};

  return <section id="mission-control" className="mc2">
    <style>{`
      .mc2{--bg:#080e16;--panel:#0d1824;--line:#2d4050;--bright:#68e5f0;--muted:#8faab9;--red:#ffa77a;--green:#86dcb8;background:var(--bg);color:#e4f1f6;padding:78px max(20px,calc((100% - 1180px)/2)) 90px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;border-block:1px solid #30414e}
      .mc2 *{box-sizing:border-box}.mc2 button{font:inherit;cursor:pointer;border-radius:0}.mc2 button:focus-visible{outline:2px solid var(--bright);outline-offset:3px}
      .mc2-kicker{display:flex;justify-content:space-between;gap:15px;color:var(--bright);font-size:11px;letter-spacing:2px;border-bottom:1px solid var(--line);padding-bottom:18px}
      .mc2 h2{font-size:clamp(42px,7.5vw,88px);line-height:.98;letter-spacing:-5px;margin:42px 0 19px;font-weight:750}.mc2 h2 span{color:var(--bright)}
      .mc2-lead{max-width:820px;color:#a8bdca;font:15px/1.8 system-ui,sans-serif}.mc2-grid{display:grid;grid-template-columns:275px minmax(0,1fr) 285px;gap:1px;background:var(--line);border:1px solid var(--line);margin-top:33px}
      .mc2-pane{background:var(--panel);min-width:0}.mc2-cap{font-size:10px;letter-spacing:1.5px;color:var(--bright);padding:18px 17px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:10px}
      .mc2-pane-inner{padding:18px}.mc2-note{font-size:12px;line-height:1.75;color:var(--muted);margin:0 0 18px}.mc2-evidence{display:block;width:100%;text-align:left;border:1px solid var(--line);background:#101f2b;color:#d7e9f0;padding:15px 13px;margin:8px 0;transition:border-color .15s,background .15s}
      .mc2-evidence:hover,.mc2-evidence.active{border-color:var(--bright);background:#132d3c}.mc2-evidence small{display:block;color:var(--muted);font-size:10px;margin-top:8px}.mc2-evidence strong{font-size:11px;letter-spacing:.7px}.mc2-chip{color:var(--green);font-size:10px;float:right}
      .mc2-detail{border-left:2px solid var(--bright);padding:13px 12px;background:#102532;font-size:11px;line-height:1.75;color:#c4dde7;margin-top:18px}
      .mc2-topology{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-bottom:26px}.mc2-node{border:1px solid #355166;min-height:100px;padding:13px 7px;background:#102435;position:relative;min-width:0}.mc2-node strong{display:block;font-size:10px;overflow-wrap:anywhere;margin:15px 0 6px}.mc2-node small{color:var(--bright);font-size:10px}.mc2-node em{display:block;color:var(--muted);font-style:normal;font-size:9px;line-height:1.5}.mc2-node:after{content:'>';position:absolute;right:-7px;top:38px;color:var(--bright);z-index:2;background:var(--bg);font-size:12px}.mc2-node:last-child:after{display:none}
      .mc2-step{border-top:1px solid var(--line);padding:17px 0}.mc2-step-head{display:flex;align-items:center;gap:11px;margin-bottom:12px}.mc2-step-head b{color:var(--bright);font-size:11px}.mc2-step-head h3{font-size:13px;margin:0;letter-spacing:.4px}.mc2-step p{font-size:11px;line-height:1.7;color:var(--muted);margin:0 0 14px}.mc2-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}
      .mc2-choice{border:1px solid #37566a;padding:13px 12px;text-align:left;background:#10202d;color:#c5dbe5;font-size:11px;line-height:1.6;min-height:76px}.mc2-choice.selected{border-color:var(--bright);background:#173747;color:white;box-shadow:inset 3px 0 var(--bright)}.mc2-choice:hover{border-color:#88dfe8}
      .mc2-evaluate{border:1px solid var(--bright);background:var(--bright);color:#071520;padding:15px 20px;font-size:11px;letter-spacing:1px;font-weight:800;width:100%;margin-top:20px}.mc2-evaluate:disabled{opacity:.42;cursor:not-allowed}.mc2-evaluate:not(:disabled):hover{background:#b3f7fb}
      .mc2-artifact-tabs{display:flex;flex-direction:column;gap:6px}.mc2-tab{width:100%;border:1px solid var(--line);padding:11px 10px;background:#0f202c;color:#a9c5d3;text-align:left;font-size:10px;letter-spacing:.2px}.mc2-tab.active{border-color:var(--bright);color:white}.mc2-artifact{border:1px solid #315366;background:#091822;padding:16px 12px;margin-top:14px;font-size:11px;line-height:1.8;color:#bdd3df;min-height:155px}.mc2-artifact b{display:block;color:var(--bright);font-size:10px;letter-spacing:1px;margin-bottom:12px}
      .mc2-trace{border-top:1px solid var(--line);margin-top:24px;padding-top:18px}.mc2-trace ol{list-style:none;margin:12px 0 0;padding:0}.mc2-trace li{padding:9px 0;border-bottom:1px solid #203747;color:#a4bece;font-size:10px;line-height:1.6}.mc2-trace li::before{content:'›';color:var(--bright);margin-right:8px}
      .mc2-bottom{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border:1px solid var(--line);margin-top:1px}.mc2-result{background:#0e1c2a;padding:24px}.mc2-result h3{font-size:20px;margin:12px 0;line-height:1.2;letter-spacing:-.4px}.mc2-result p{color:#acc3d0;font-size:12px;line-height:1.8}.mc2-result.good h3{color:var(--green)}.mc2-result.bad h3{color:var(--red)}.mc2-readout{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px}.mc2-readout div{border-top:1px solid var(--line);padding-top:10px}.mc2-readout strong{font-size:23px;color:#fff;display:block}.mc2-readout small{font-size:9px;letter-spacing:1px;color:var(--muted)}.mc2-reset{border:1px solid #547084;color:#d5eaf4;background:transparent;font-size:11px;padding:12px 15px;margin-top:16px}.mc2-reset:hover{border-color:var(--bright)}.mc2-disclaimer{color:#8299aa;font-size:10px;letter-spacing:.4px;line-height:1.8;margin-top:19px}
      @media(max-width:1100px){.mc2-grid{grid-template-columns:230px minmax(0,1fr)}.mc2-grid>.mc2-pane:last-child{grid-column:1/-1}.mc2-artifact-tabs{display:grid;grid-template-columns:repeat(4,1fr)}}
      @media(max-width:730px){.mc2{padding:55px 18px}.mc2-grid,.mc2-bottom{grid-template-columns:1fr}.mc2-grid>.mc2-pane:last-child{grid-column:auto}.mc2 h2{letter-spacing:-2px}.mc2-topology{grid-template-columns:repeat(3,minmax(0,1fr))}.mc2-node:nth-child(3):after{display:none}}
      @media(max-width:460px){.mc2-topology{grid-template-columns:repeat(2,minmax(0,1fr))}.mc2-node:after{display:none}.mc2-actions,.mc2-artifact-tabs{grid-template-columns:1fr}.mc2-kicker{font-size:9px}.mc2 h2{font-size:43px}}
      @media(prefers-reduced-motion:reduce){.mc2 *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
    `}</style>
    <div className="mc2-kicker"><span>04 / ENGINEERING COMMAND CENTER</span><span>MISSION 001 / IDENTITY HANDOFF</span></div>
    <h2>CONTROL THE <span>OUTCOME.</span></h2>
    <p className="mc2-lead">Direct a five-role engineering team investigating a persistent identity-provider session. Inspect evidence, select an architecture, evaluate a reviewer finding, and define the verification boundary. Your decisions change the result.</p>
    <div className="mc2-grid">
      <aside className="mc2-pane">
        <div className="mc2-cap"><span>01 / EVIDENCE INTAKE</span><span>{examined.length}/3</span></div>
        <div className="mc2-pane-inner">
          <p className="mc2-note">Incident: User A signs out, but switching to User B fails in a private browser session. Which boundary is actually failing?</p>
          {evidence.map(item => <button key={item.id} className={`mc2-evidence ${activeEvidence === item.id && examined.includes(item.id) ? 'active' : ''}`} onClick={() => selectEvidence(item.id)} aria-pressed={activeEvidence === item.id && examined.includes(item.id)}><strong>{item.name}</strong>{examined.includes(item.id) && <span className="mc2-chip">INSPECTED</span>}<small>{item.signal}</small></button>)}
          <div className="mc2-detail" aria-live="polite">{examined.includes(activeEvidence) ? evidence.find(e => e.id === activeEvidence)?.detail : 'Select an evidence record to inspect its implications.'}</div>
        </div>
      </aside>
      <div className="mc2-pane">
        <div className="mc2-cap"><span>02 / AGENT ORCHESTRATION</span><span>FIVE ROLES</span></div>
        <div className="mc2-pane-inner">
          <div className="mc2-topology" aria-label="Five roles with a left-to-right workflow">{agentNames.map((agent, i) => <div className="mc2-node" key={agent.id}><small>0{i+1} / NODE</small><strong>{agent.name}</strong><em>{agent.role}</em></div>)}</div>
          <div className="mc2-step"><div className="mc2-step-head"><b>01</b><h3>ASSIGN ARCHITECTURE STRATEGY</h3></div><p>Choose the approach the implementation agent should explore.</p><div className="mc2-actions"><button className={`mc2-choice ${strategy === 'local' ? 'selected' : ''}`} onClick={() => {setStrategy('local');setShowResult(false);}} aria-pressed={strategy === 'local'}>Clear frontend storage only</button><button className={`mc2-choice ${strategy === 'identity' ? 'selected' : ''}`} onClick={() => {setStrategy('identity');setShowResult(false);}} aria-pressed={strategy === 'identity'}>Investigate provider-side session termination</button></div></div>
          <div className="mc2-step"><div className="mc2-step-head"><b>02</b><h3>DISPOSITION REVIEWER FINDING</h3></div><p>Reviewer flags that browser cleanup may leave the remote identity session active.</p><div className="mc2-actions"><button className={`mc2-choice ${finding === 'accept' ? 'selected' : ''}`} onClick={() => {setFinding('accept');setShowResult(false);}} aria-pressed={finding === 'accept'}>Accept finding / require evidence</button><button className={`mc2-choice ${finding === 'reject' ? 'selected' : ''}`} onClick={() => {setFinding('reject');setShowResult(false);}} aria-pressed={finding === 'reject'}>Dismiss finding / proceed</button></div></div>
          <div className="mc2-step"><div className="mc2-step-head"><b>03</b><h3>SET VERIFICATION SCOPE</h3></div><p>The validation agent needs an explicit test contract.</p><div className="mc2-actions"><button className={`mc2-choice ${test === 'ui' ? 'selected' : ''}`} onClick={() => {setTest('ui');setShowResult(false);}} aria-pressed={test === 'ui'}>Verify only local UI sign-out</button><button className={`mc2-choice ${test === 'integration' ? 'selected' : ''}`} onClick={() => {setTest('integration');setShowResult(false);}} aria-pressed={test === 'integration'}>Verify provider logout and cross-account flow</button></div></div>
          <button className="mc2-evaluate" disabled={!ready} onClick={() => setShowResult(true)}>{showResult ? 'RE-EVALUATE DECISION →' : 'EVALUATE ENGINEERING DECISION →'}</button>
        </div>
      </div>
      <aside className="mc2-pane">
        <div className="mc2-cap"><span>03 / AGENT ARTIFACTS</span><span>{decisions.filter(Boolean).length}/3</span></div>
        <div className="mc2-pane-inner">
          <div className="mc2-artifact-tabs">{artifacts.map((item,i) => <button key={item.title} className={`mc2-tab ${activeArtifact === i ? 'active' : ''}`} onClick={() => setActiveArtifact(i)} aria-pressed={activeArtifact === i}>{item.title}</button>)}</div>
          <div className="mc2-artifact" aria-live="polite"><b>{artifacts[activeArtifact].agent} / OUTPUT</b>{artifacts[activeArtifact].content}</div>
          <div className="mc2-trace"><div className="mc2-cap" style={{padding:'0 0 12px',border:0}}>EXECUTION TRACE / EVENT LOG</div><ol aria-live="polite">{traces.map((event,i) => <li key={`${i}-${event}`}>{event}</li>)}</ol></div>
        </div>
      </aside>
    </div>
    <div className="mc2-bottom">
      <div className={`mc2-result ${showResult ? (verified ? 'good' : 'bad') : ''}`}><div className="mc2-cap" style={{padding:'0 0 12px',border:0}}>04 / DECISION REVIEW</div><h3>{!showResult ? 'AWAITING EVALUATION' : verified ? 'CONTROLLED PLAN / IMPLEMENTATION READY' : 'REVIEW REQUIRED / UNRESOLVED RISK'}</h3><p>{!showResult ? 'Complete three engineering decisions, then evaluate. Inspecting the evidence helps distinguish local state from identity-provider state.' : verified ? 'The selected plan addresses the correct session boundary, accepts the material review finding, and defines cross-account verification. The plan is eligible for implementation; no actual logout fix or test run has occurred.' : 'The chosen plan leaves one or more material gaps. Reinspect the evidence and revise the strategy, reviewer disposition, or validation scope.'}</p><button className="mc2-reset" onClick={reset}>↺ RESET INVESTIGATION</button></div>
      <div className="mc2-result"><div className="mc2-cap" style={{padding:'0 0 12px',border:0}}>05 / EVALUATION SIGNALS</div><div className="mc2-readout"><div><strong>{score}<span style={{fontSize:13,color:'#8faab9'}}>/100</span></strong><small>PLAN COMPLETENESS</small></div><div><strong>{riskCount}</strong><small>RISK INDICATORS</small></div><div><strong>{examined.length}/3</strong><small>EVIDENCE REVIEWED</small></div><div><strong>{decisions.filter(Boolean).length}/3</strong><small>DECISIONS SET</small></div></div><p className="mc2-disclaimer">SYNTHETIC SCENARIO · DETERMINISTIC SCORING · NO LIVE AGENTS · NO TEST EXECUTION · ZERO EXTERNAL API COST</p></div>
    </div>
  </section>;
}
