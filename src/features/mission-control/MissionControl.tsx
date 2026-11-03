import { useMemo, useState } from 'react';

type EvidenceId = 'browser' | 'identity' | 'network';
type Strategy = 'none' | 'local' | 'provider';
type Review = 'none' | 'dismiss' | 'investigate';
type TestPlan = 'none' | 'ui' | 'cross';
type Phase = 'brief' | 'investigate' | 'design' | 'review' | 'verify' | 'outcome';

type RecordItem = { id: EvidenceId; title: string; subtitle: string; headline: string; lines: string[]; finding: string };
const records: RecordItem[] = [
  {
    id: 'browser', title: 'BROWSER STORAGE', subtitle: 'CLIENT TRACE / 01', headline: 'Tokens gone. Session still active.',
    lines: ['10:42:11  [UI] logout initiated', '10:42:11  localStorage: access_token = null', '10:42:11  sessionStorage: cleared', '10:42:14  /authorize → redirect', '10:42:14  interactive login skipped'],
    finding: 'Clearing application tokens did not terminate the identity-provider browser session.'
  },
  {
    id: 'identity', title: 'IDENTITY SESSION', subtitle: 'AUTH PROVIDER / 02', headline: 'Remote session survives sign-out.',
    lines: ['GET /authorize?client_id=…', 'cookie: idp_session=[redacted]', 'response: 302 /callback?code=…', 'prompt: no credential challenge', 'result: original identity reused'],
    finding: 'The authentication boundary extends beyond the frontend. Provider session termination needs investigation.'
  },
  {
    id: 'network', title: 'LOGOUT RESPONSE', subtitle: 'NETWORK CAPTURE / 03', headline: 'Logout request rejected.',
    lines: ['POST /logout', 'HTTP 400 Bad Request', 'post_logout_redirect_uri: rejected', 'id_token_hint: missing or invalid', 'provider session: unchanged'],
    finding: 'The logout flow has a redirect/token-hint configuration issue; blindly retrying is not a fix.'
  }
];
const phases: { id: Phase; label: string; sub: string }[] = [
  { id:'brief', label:'BRIEF', sub:'Understand the incident' },
  { id:'investigate', label:'EVIDENCE', sub:'Inspect system signals' },
  { id:'design', label:'ARCHITECTURE', sub:'Assign implementation approach' },
  { id:'review', label:'REVIEW', sub:'Handle agent disagreement' },
  { id:'verify', label:'VALIDATION', sub:'Define proof of correctness' },
  { id:'outcome', label:'DEBRIEF', sub:'Inspect the engineering result' }
];
const roleNodes = [
  { label:'ORCHESTRATOR', id:'01', sub:'Context + scope' },
  { label:'ARCHITECT', id:'02', sub:'System boundary' },
  { label:'IMPLEMENTER', id:'03', sub:'Change proposal' },
  { label:'REVIEWER', id:'04', sub:'Risk assessment' },
  { label:'VALIDATOR', id:'05', sub:'Evidence + tests' }
];
const phaseIndex = (phase: Phase) => phases.findIndex(p => p.id === phase);

export default function MissionControl() {
  const [phase, setPhase] = useState<Phase>('brief');
  const [opened, setOpened] = useState<EvidenceId[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<EvidenceId>('browser');
  const [strategy, setStrategy] = useState<Strategy>('none');
  const [review, setReview] = useState<Review>('none');
  const [testPlan, setTestPlan] = useState<TestPlan>('none');
  const [inspect, setInspect] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [activeOutput, setActiveOutput] = useState<'trace'|'artifact'>('trace');

  const inspectedEnough = opened.includes('browser') && opened.includes('identity');
  const passed = inspectedEnough && strategy === 'provider' && review === 'investigate' && testPlan === 'cross';
  const risks = [
    ...(!inspectedEnough ? ['Remote session boundary not established'] : []),
    ...(strategy === 'local' ? ['Local-only cleanup cannot end provider session'] : []),
    ...(review === 'dismiss' ? ['Material review finding dismissed'] : []),
    ...(testPlan === 'ui' ? ['Provider behavior unverified'] : [])
  ];
  const score = Math.max(0, Math.min(100, opened.length * 10 + (strategy === 'provider' ? 30 : 0) + (review === 'investigate' ? 20 : 0) + (testPlan === 'cross' ? 20 : 0)));
  const activeRecord = records.find(r => r.id === selectedRecord)!;
  const current = phaseIndex(phase);
  const canContinue = phase === 'brief' ||
    (phase === 'investigate' && inspectedEnough) ||
    (phase === 'design' && strategy !== 'none') ||
    (phase === 'review' && review !== 'none') ||
    (phase === 'verify' && testPlan !== 'none');
  const activity = useMemo(() => [
    { tag:'SYSTEM', text:'Investigation created: cross-account sign-out defect' },
    ...opened.map(id => ({ tag:'EVIDENCE', text:`Analyzed ${records.find(r=>r.id===id)?.title.toLowerCase()}` })),
    ...(strategy !== 'none' ? [{tag:'ARCHITECT',text:strategy === 'provider' ? 'Provider-aware logout proposed; redirect and token-hint checks required' : 'Local storage cleanup proposed; provider boundary not addressed'}] : []),
    ...(review !== 'none' ? [{tag:'REVIEWER',text:review === 'investigate' ? 'Session persistence finding escalated for validation' : 'Session persistence finding dismissed'}] : []),
    ...(testPlan !== 'none' ? [{tag:'VALIDATOR',text:testPlan === 'cross' ? 'Cross-account and provider logout contract defined' : 'UI-only smoke check selected'}] : []),
    ...(phase === 'outcome' ? [{tag:'GATE',text:passed ? 'Plan meets simulated review gate. Actual tests still required.' : 'Blocked: unresolved design or verification risks.'}] : [])
  ], [opened,strategy,review,testPlan,phase,passed]);
  const artifact = phase === 'investigate' ? 'EVIDENCE SUMMARY\nUser A signs out. Client token storage clears. Identity-provider session persists. Switching to User B does not produce the expected login challenge.' :
    phase === 'design' ? `ARCHITECTURE DECISION RECORD\nChosen approach: ${strategy === 'provider' ? 'provider-aware logout' : strategy === 'local' ? 'browser-only cleanup' : 'not assigned'}.\nBoundary: frontend credentials vs independent identity-provider browser session.` :
    phase === 'review' ? `REVIEW DISPOSITION\nReviewer warns that local token clearing does not terminate the provider session.\nDisposition: ${review === 'investigate' ? 'investigate and require evidence' : review === 'dismiss' ? 'dismiss as speculative' : 'awaiting human decision'}.` :
    phase === 'verify' || phase === 'outcome' ? `VERIFICATION CONTRACT\n${testPlan === 'cross' ? 'Confirm redirect allowlist, provider session termination, account A logout → account B login, and incognito behavior.' : testPlan === 'ui' ? 'Confirm the local UI clears displayed account state only.' : 'Pending verification selection.'}\nSIMULATION ONLY: No live tests executed.` :
    'TASK CONTRACT\nScope: sign out current identity, prevent unintended session reuse, enable account switching.\nConstraints: preserve supported identity-provider behavior; do not expose credentials.';
  const reset = () => { setPhase('brief'); setOpened([]); setSelectedRecord('browser'); setStrategy('none'); setReview('none'); setTestPlan('none'); setInspect(false); setShowLog(false); setActiveOutput('trace'); };
  const read = (id: EvidenceId) => { setSelectedRecord(id); setOpened(x=>x.includes(id)?x:[...x,id]); setInspect(true); };
  const advance = () => { if (!canContinue || current >= phases.length-1) return; setPhase(phases[current+1].id); setInspect(false); };
  const agentStatus = (i: number) => {
    const unlocked = [0,2,3,4,5][i];
    return current >= unlocked ? 'done' : current === Math.max(0,unlocked-1) ? 'active' : 'idle';
  };

  return <section id="mission-control" className="cm3">
    <style>{`
      .cm3{--base:#070d14;--panel:#0d1722;--panel2:#101e2b;--hair:#2c4353;--signal:#79e9f4;--ink:#e6f2fa;--low:#91aab9;--warn:#f3ad7c;background:var(--base);color:var(--ink);padding:70px max(20px,calc((100% - 1180px)/2)) 90px;font-family:ui-monospace,'SFMono-Regular',Consolas,monospace;border-top:1px solid #2b4556;isolation:isolate}
      .cm3 *{box-sizing:border-box}.cm3 button{font:inherit;cursor:pointer;border-radius:0}.cm3 button:focus-visible{outline:2px solid var(--signal);outline-offset:3px}.cm3 button:disabled{opacity:.35;cursor:not-allowed}.cm3 svg{display:block}
      .cm3-overline,.cm3-micro{font-size:10px;letter-spacing:1.6px;color:var(--signal)}.cm3-top{border-bottom:1px solid var(--hair);padding-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:15px}.cm3-ready{display:flex;align-items:center;gap:9px;color:#acd0c5;font-size:10px;letter-spacing:1px}.cm3-led{width:7px;height:7px;background:#7cdbbd;box-shadow:0 0 12px #7cdbbd66}
      .cm3-title{font-size:clamp(43px,7vw,87px);line-height:.98;letter-spacing:-5px;font-weight:750;margin:39px 0 17px}.cm3-title span{color:var(--signal)}.cm3-intro{max-width:780px;color:#b0c6d4;font:15px/1.8 system-ui,sans-serif;margin-bottom:30px}
      .cm3-frame{border:1px solid var(--hair);background:var(--panel)}.cm3-toolbar{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 18px;background:#101c29;border-bottom:1px solid var(--hair)}.cm3-toolbar strong{font-size:11px;letter-spacing:1px}.cm3-toolbar span{font-size:10px;color:var(--low)}
      .cm3-stagebar{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));border-bottom:1px solid var(--hair)}.cm3-stage{padding:15px 9px 13px;border:0;border-right:1px solid var(--hair);background:#0b1520;color:#5e7c8e;text-align:left;min-width:0}.cm3-stage:last-child{border-right:0}.cm3-stage b{display:block;font-size:11px;letter-spacing:.3px}.cm3-stage small{font-size:9px;display:block;margin-top:7px;line-height:1.4}.cm3-stage.active{background:#173444;color:#e6f9ff;box-shadow:inset 0 3px var(--signal)}.cm3-stage.done{color:#8bd3bf}.cm3-stage:disabled{cursor:default;opacity:1}.cm3-stage.done:hover{background:#142b35}
      .cm3-grid{display:grid;grid-template-columns: minmax(0,1.55fr) minmax(270px,.9fr)}.cm3-work{min-width:0;padding:25px 27px 29px;border-right:1px solid var(--hair)}.cm3-rail{min-width:0;background:#0b1621}.cm3-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}.cm3-hd h3{margin:0;font-size:20px;font-weight:650;letter-spacing:-.7px}.cm3-counter{font-size:10px;color:var(--low)}
      .cm3-graph{position:relative;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;padding:22px 0 27px}.cm3-graph:before{content:'';position:absolute;left:5%;right:5%;top:57px;border-top:1px dashed #4b8591}.cm3-agent{position:relative;background:#101d2c;border:1px solid #395367;min-width:0;min-height:112px;padding:14px 10px;transition:border-color .2s,background .2s,box-shadow .2s}.cm3-agent .number{font-size:10px;color:#7c9aaf}.cm3-agent strong{display:block;font-size:10px;letter-spacing:.3px;overflow-wrap:anywhere;margin:24px 0 9px}.cm3-agent em{font-size:9px;color:var(--low);font-style:normal;line-height:1.5;display:block}.cm3-agent.done{border-color:#397a76}.cm3-agent.done .number{color:#7bdec4}.cm3-agent.active{border-color:var(--signal);background:#123143;box-shadow:inset 0 0 0 1px #4a9cad,0 0 24px #4fbfd51a}.cm3-agent.active .number{color:var(--signal)}
      .cm3-body{min-height:300px;border-top:1px solid var(--hair);padding-top:24px}.cm3-body h4{font-size:24px;line-height:1.18;letter-spacing:-.6px;margin:11px 0}.cm3-body p{font-size:13px;line-height:1.8;color:#acc4d0;max-width:670px}.cm3-brief{border-left:2px solid var(--signal);padding:14px 18px;background:#102433;font-size:12px;line-height:1.8;color:#c4dbe5;margin:20px 0}
      .cm3-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:22px}.cm3-btn{padding:14px 17px;background:#132b3b;color:#dbf3fa;border:1px solid #477289;font-size:11px;letter-spacing:.4px;text-align:left}.cm3-btn:hover{border-color:var(--signal);background:#173c4f}.cm3-btn.primary{background:var(--signal);border-color:var(--signal);color:#08131e;font-weight:800}.cm3-btn.primary:hover{background:#b4f5f8}.cm3-btn.selected{border-color:var(--signal);box-shadow:inset 3px 0 var(--signal);background:#173b4a;color:white}
      .cm3-options{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin:20px 0}.cm3-option{border:1px solid #395365;padding:17px;text-align:left;background:#0c1d29;color:#e4f2f9;min-height:140px}.cm3-option small{display:block;color:var(--signal);font-size:10px;letter-spacing:1.2px;margin-bottom:14px}.cm3-option strong{font-size:14px;line-height:1.5;display:block;margin-bottom:11px}.cm3-option span{font-size:11px;color:var(--low);line-height:1.65;display:block}.cm3-option:hover{border-color:#8bd6e1}.cm3-option.selected{border-color:var(--signal);background:#163849;box-shadow:inset 3px 0 var(--signal)}
      .cm3-evidence{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:22px}.cm3-ev{background:#102230;border:1px solid var(--hair);color:#dcecf4;min-height:100px;padding:15px 11px;text-align:left}.cm3-ev strong{font-size:11px;line-height:1.5;display:block}.cm3-ev small{display:block;font-size:9px;color:var(--low);margin:14px 0 0}.cm3-ev:hover,.cm3-ev.selected{border-color:var(--signal)}.cm3-ev.opened strong:before{content:'✓ ';color:#88dbb9}.cm3-terminal{margin-top:13px;border:1px solid #345669;background:#07131c;padding:0;overflow:hidden}.cm3-terminal-head{padding:11px 15px;border-bottom:1px solid #243e4e;display:flex;justify-content:space-between;color:var(--signal);font-size:10px;letter-spacing:.7px}.cm3-terminal pre{margin:0;padding:18px 16px;color:#a9d5dc;font:11px/1.9 ui-monospace,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere;min-height:160px}.cm3-terminal-foot{font-size:11px;line-height:1.7;color:#d6e4ec;background:#0e2430;padding:12px 16px;border-top:1px solid #2c4c5c}
      .cm3-rightcap{display:flex;justify-content:space-between;border-bottom:1px solid var(--hair);padding:18px;color:var(--signal);font-size:10px;letter-spacing:1px}.cm3-railinside{padding:18px}.cm3-role{display:flex;gap:10px;align-items:flex-start;border-bottom:1px solid #233b4c;padding:11px 0}.cm3-role small{font-size:9px;color:var(--signal);min-width:24px}.cm3-role strong{font-size:11px;line-height:1.5}.cm3-role em{font-size:10px;color:#87a2b3;font-style:normal;display:block;margin-top:5px}.cm3-tabrow{display:flex;border:1px solid var(--hair);margin-top:24px}.cm3-tab{flex:1;border:0;border-right:1px solid var(--hair);padding:11px 9px;background:#0c1925;color:#90acbd;font-size:10px}.cm3-tab:last-child{border-right:0}.cm3-tab.on{color:#e6faff;background:#153344}.cm3-log{padding:15px 0;max-height:290px;overflow:auto}.cm3-logline{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #203544;font-size:10px;line-height:1.6;color:#afc6d4}.cm3-logline b{font-weight:500;color:#80e2eb;min-width:74px}.cm3-artifact{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px;line-height:1.85;color:#bed3df;margin:16px 0}.cm3-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 19px;border-top:1px solid var(--hair);background:#0c1824}.cm3-progress{display:flex;align-items:center;gap:12px;color:#91abba;font-size:10px}.cm3-meter{width:130px;height:4px;background:#203749}.cm3-meter div{height:100%;background:var(--signal);transition:width .2s}.cm3-footnote{font-size:10px;color:#7792a5;line-height:1.7;margin-top:20px}
      .cm3-score{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--hair);margin-top:16px}.cm3-score div{padding:17px;border-right:1px solid var(--hair)}.cm3-score div:last-child{border:0}.cm3-score strong{display:block;font-size:23px;margin-bottom:7px}.cm3-score span{color:var(--low);font-size:9px;letter-spacing:1px}.cm3-risk{border:1px solid #6c5143;background:#231b1a;color:#f2c3a4;padding:13px 16px;margin:10px 0;font-size:11px}.cm3-good{border:1px solid #3c766f;background:#112c2b;color:#92e3c6;padding:15px 16px;margin:18px 0;font-size:12px;line-height:1.7}
      @media(max-width:1000px){.cm3-grid{grid-template-columns:1fr}.cm3-work{border-right:0;border-bottom:1px solid var(--hair)}.cm3-railinside{display:grid;grid-template-columns:1fr 1fr;gap:25px}.cm3-tabrow{margin-top:0}}
      @media(max-width:700px){.cm3{padding:52px 18px 70px}.cm3-title{letter-spacing:-2px}.cm3-stagebar{grid-template-columns:repeat(3,1fr)}.cm3-stage:nth-child(3){border-right:0}.cm3-stage:nth-child(-n+3){border-bottom:1px solid var(--hair)}.cm3-work{padding:20px 15px}.cm3-graph{grid-template-columns:repeat(3,1fr)}.cm3-graph:before{display:none}.cm3-railinside{display:block}.cm3-tabrow{margin-top:22px}.cm3-evidence{grid-template-columns:1fr}.cm3-ev{min-height:70px}.cm3-options{grid-template-columns:1fr}.cm3-footer{flex-wrap:wrap}.cm3-hd h3{font-size:17px}}
      @media(max-width:440px){.cm3-top{align-items:flex-start;flex-direction:column}.cm3-graph{grid-template-columns:repeat(2,1fr)}.cm3-score{grid-template-columns:1fr}.cm3-score div{border-right:0;border-bottom:1px solid var(--hair)}.cm3-score div:last-child{border-bottom:0}.cm3-stage{padding:10px 7px}.cm3-stage b{font-size:9px}.cm3-stage small{font-size:8px}.cm3-meter{width:65px}}
      @media(prefers-reduced-motion:reduce){.cm3 *{transition:none!important;animation:none!important}}
    `}</style>
    <div className="cm3-top"><span className="cm3-overline">04 / ENGINEERING COMMAND CENTER</span><span className="cm3-ready"><span className="cm3-led"/> LOCAL SIMULATION · NO API CALLS</span></div>
    <h2 className="cm3-title">DIRECT THE <span>SYSTEM.</span></h2>
    <p className="cm3-intro">Investigate a broken authentication flow. Delegate decisions, inspect technical evidence, and control the validation gate. Nothing here is predetermined by an AI service; every result is reproducible and explainable.</p>
    <div className="cm3-frame">
      <div className="cm3-toolbar"><strong>INCIDENT / AUTH-001</strong><span>{phase === 'brief' ? 'READY TO INITIATE' : phase === 'outcome' ? 'INVESTIGATION COMPLETE' : 'INVESTIGATION ACTIVE'}</span></div>
      <div className="cm3-stagebar" aria-label="Investigation stages">{phases.map((s,i) => <button key={s.id} className={`cm3-stage ${i===current?'active':i<current?'done':''}`} disabled={i>current} onClick={() => {if(i<current) setPhase(s.id);}} aria-current={i===current?'step':undefined}><b>{String(i+1).padStart(2,'0')} / {s.label}</b><small>{s.sub}</small></button>)}</div>
      <div className="cm3-grid">
        <div className="cm3-work">
          <div className="cm3-hd"><h3>ACTIVE WORKSPACE</h3><span className="cm3-counter">{String(current+1).padStart(2,'0')} / 06</span></div>
          <div className="cm3-graph" aria-label="Agent workflow status">{roleNodes.map((r,i) => <div key={r.id} className={`cm3-agent ${agentStatus(i)}`}><span className="number">{r.id} / {agentStatus(i).toUpperCase()}</span><strong>{r.label}</strong><em>{r.sub}</em></div>)}</div>
          <div className="cm3-body">
            {phase==='brief' && <><span className="cm3-micro">MISSION DIRECTIVE</span><h4>Account switching fails after sign-out.</h4><p>User A signs out. In an incognito browser session, signing in as User B fails or silently returns to User A. The proposed fix clears local tokens, but the real system has more than one session boundary.</p><div className="cm3-brief"><strong>YOUR ROLE / ENGINEERING LEAD</strong><div>Inspect evidence, decide what the implementation agent should address, respond to a review warning, and define the proof required before release.</div></div><p>No instructions to memorize. The interface will guide you one decision at a time.</p></>}
            {phase==='investigate' && <><span className="cm3-micro">EVIDENCE INTAKE / CLICK TO OPEN</span><h4>What is the failed boundary?</h4><p>Inspect at least the browser and identity-provider traces. The terminal updates with each record and the agent log records what you've inspected.</p><div className="cm3-evidence">{records.map(r=><button key={r.id} className={`cm3-ev ${selectedRecord===r.id&&inspect?'selected':''} ${opened.includes(r.id)?'opened':''}`} onClick={()=>read(r.id)} aria-pressed={selectedRecord===r.id&&inspect}><strong>{r.title}</strong><small>{r.subtitle}</small></button>)}</div><div className="cm3-terminal"><div className="cm3-terminal-head"><span>{inspect?activeRecord.title:'AWAITING RECORD SELECTION'}</span><span>READ-ONLY / SYNTHETIC</span></div><pre>{inspect?activeRecord.lines.join('\n'):'> SELECT AN EVIDENCE RECORD TO INSPECT\n> SYNTHETIC INVESTIGATION DATA'}</pre><div className="cm3-terminal-foot">{inspect?activeRecord.finding:'The evidence viewer is idle.'}</div></div></>}
            {phase==='design' && <><span className="cm3-micro">ARCHITECT → IMPLEMENTER</span><h4>Assign the implementation boundary.</h4><p>The agent suggests a fast local cleanup. You can authorize that narrow change—or require investigation of provider-side logout, redirect configuration, and session termination.</p><div className="cm3-options"><button className={`cm3-option ${strategy==='local'?'selected':''}`} onClick={()=>setStrategy('local')} aria-pressed={strategy==='local'}><small>PROPOSAL / FAST PATCH</small><strong>Clear browser state</strong><span>Remove client tokens and redirect to the sign-in page.</span></button><button className={`cm3-option ${strategy==='provider'?'selected':''}`} onClick={()=>setStrategy('provider')} aria-pressed={strategy==='provider'}><small>PROPOSAL / SESSION BOUNDARY</small><strong>Investigate provider logout</strong><span>Verify ID token hints, redirect allowlisting and provider session termination.</span></button></div><div className="cm3-brief">{strategy==='none'?'AWAITING DIRECTIVE / Choose an approach.':strategy==='provider'?'ARCHITECTURE UPDATED / The agent is now scoped to investigate the identity-provider session and configuration.':'ARCHITECTURE UPDATED / The agent will modify local state, but the remote provider session remains outside its scope.'}</div></>}
            {phase==='review' && <><span className="cm3-micro">REVIEWER / MATERIAL FINDING</span><h4>One reviewer challenges the proposed fix.</h4><div className="cm3-terminal"><div className="cm3-terminal-head"><span>REVIEW-042 / SECURITY</span><span>SEVERITY: MATERIAL</span></div><pre>{'Finding: Local token removal is not\nevidence of provider session termination.\n\nObserved: /authorize still sees an\nactive provider cookie after logout.\n\nRequest: Prove cross-account sign-in\nworks after session termination.'}</pre><div className="cm3-terminal-foot">The reviewer offers evidence, not a speculative refactor. Your disposition changes the evaluation.</div></div><div className="cm3-options"><button className={`cm3-option ${review==='investigate'?'selected':''}`} onClick={()=>setReview('investigate')} aria-pressed={review==='investigate'}><small>REVIEW DISPOSITION / A</small><strong>Accept; request proof</strong><span>Require the implementation and validator agents to address the material finding.</span></button><button className={`cm3-option ${review==='dismiss'?'selected':''}`} onClick={()=>setReview('dismiss')} aria-pressed={review==='dismiss'}><small>REVIEW DISPOSITION / B</small><strong>Dismiss; continue</strong><span>Proceed without resolving the reviewer’s provider-session concern.</span></button></div></>}
            {phase==='verify' && <><span className="cm3-micro">VALIDATOR / TEST CONTRACT</span><h4>What evidence permits release?</h4><p>A green UI check does not necessarily prove a user can switch identities. Define what the validation agent would need to test.</p><div className="cm3-options"><button className={`cm3-option ${testPlan==='ui'?'selected':''}`} onClick={()=>setTestPlan('ui')} aria-pressed={testPlan==='ui'}><small>VALIDATION / NARROW</small><strong>Local UI smoke test</strong><span>Check that application state clears and the login screen renders.</span></button><button className={`cm3-option ${testPlan==='cross'?'selected':''}`} onClick={()=>setTestPlan('cross')} aria-pressed={testPlan==='cross'}><small>VALIDATION / FULL BOUNDARY</small><strong>Cross-account integration</strong><span>Test provider sign-out, callback configuration, and User A → User B login in private mode.</span></button></div><div className="cm3-brief">No real tests run here. This decision defines the required verification contract for a future implementation.</div></>}
            {phase==='outcome' && <><span className="cm3-micro">ENGINEERING DEBRIEF / DETERMINISTIC RESULT</span><h4>{passed?'Controlled plan. Ready for implementation.':'Review gate blocked. Risks remain.'}</h4><p>{passed?'The engineering plan addresses the correct session boundary and requires evidence before approval. This is a successful planning outcome—not evidence of a working deployed fix.':'The choices leave material uncertainty or omit verification. The system does not approve the plan for implementation without further review.'}</p>{passed?<div className="cm3-good">REVIEW GATE / PASS — Plan accepted for implementation. Live authentication behavior remains untested.</div>:risks.map(x=><div className="cm3-risk" key={x}>BLOCKER / {x}</div>)}<div className="cm3-score"><div><strong>{score}/100</strong><span>PLAN SCORE*</span></div><div><strong>{opened.length}/3</strong><span>RECORDS INSPECTED</span></div><div><strong>{risks.length}</strong><span>OPEN RISK INDICATORS</span></div></div><p>*Illustrative scoring: 10 points per inspected record, 30 for provider-aware design, 20 for material review handling and 20 for cross-account verification. No real agent calls or tests.</p></>}
          </div>
        </div>
        <aside className="cm3-rail"><div className="cm3-rightcap"><span>TELEMETRY / ARTIFACTS</span><span>LOCAL</span></div><div className="cm3-railinside"><div><div className="cm3-micro">ENGINEERING ROLES</div>{roleNodes.map(r=><div className="cm3-role" key={r.id}><small>{r.id}</small><div><strong>{r.label}</strong><em>{r.sub}</em></div></div>)}</div><div><div className="cm3-tabrow"><button className={`cm3-tab ${activeOutput==='trace'?'on':''}`} onClick={()=>setActiveOutput('trace')} aria-pressed={activeOutput==='trace'}>EVENT TRACE</button><button className={`cm3-tab ${activeOutput==='artifact'?'on':''}`} onClick={()=>setActiveOutput('artifact')} aria-pressed={activeOutput==='artifact'}>AGENT OUTPUT</button></div>{activeOutput==='trace'?<div className="cm3-log" aria-live="polite">{activity.map((x,i)=><div key={`${i}-${x.tag}`} className="cm3-logline"><b>{x.tag}</b><span>{x.text}</span></div>)}</div>:<pre className="cm3-artifact" aria-live="polite">{artifact}</pre>}</div></div></aside>
      </div>
      <div className="cm3-footer"><div className="cm3-progress"><span>INVESTIGATION</span><div className="cm3-meter"><div style={{width:`${Math.round(current/5*100)}%`}}/></div><span>{Math.round(current/5*100)}%</span></div><div className="cm3-actions" style={{margin:0}}>{phase==='outcome'?<><button className="cm3-btn" onClick={()=>setPhase('investigate')}>REVISIT EVIDENCE ↗</button><button className="cm3-btn primary" onClick={reset}>NEW INVESTIGATION ↻</button></>:<><button className="cm3-btn" onClick={()=>setShowLog(x=>!x)}>{showLog?'HIDE':'SHOW'} DECISION LOG</button><button className="cm3-btn primary" disabled={!canContinue} onClick={advance}>{phase==='brief'?'INITIATE INVESTIGATION →':phase==='verify'?'RUN REVIEW GATE →':'CONTINUE →'}</button></>}</div></div>
      {showLog&&phase!=='outcome'&&<div className="cm3-terminal" style={{margin:'0 19px 18px'}}><div className="cm3-terminal-head">DECISION LOG / LOCAL SESSION</div><pre>{activity.map(x=>`[${x.tag}] ${x.text}`).join('\n')}</pre></div>}
    </div>
    <p className="cm3-footnote">AUTH-001 IS A FICTIONALIZED ENGINEERING SIMULATION. AGENT OUTPUTS ARE DETERMINISTIC. NO LIVE AI, IDENTITY PROVIDER, PAID API, OR TEST RUN IS CONNECTED.</p>
  </section>;
}
