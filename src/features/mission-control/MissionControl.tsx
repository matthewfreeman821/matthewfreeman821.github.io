
import { useState } from 'react';

type Mission = {
  title: string;
  classification: string;
  problem: string;
  risk: string;
  checks: string[];
};

const missions: Mission[] = [
  {
    title: 'IDENTITY HANDOFF',
    classification: 'SECURITY / SESSION',
    problem: 'An AI agent proposes clearing local storage to fix an account-switching logout defect.',
    risk: 'The identity-provider session can persist even after local state is cleared.',
    checks: ['Inspect identity-provider logout', 'Verify redirect configuration', 'Test switching between accounts']
  },
  {
    title: 'LATENCY CONTAINMENT',
    classification: 'PERFORMANCE / DATA',
    problem: 'An agent introduces Redis caching to accelerate an API but does not account for invalidation.',
    risk: 'A faster response may contain stale data after writes.',
    checks: ['Inspect mutation paths', 'Define cache invalidation', 'Test write-then-read consistency']
  },
  {
    title: 'REVIEW DISAGREEMENT',
    classification: 'QUALITY / CODE REVIEW',
    problem: 'Two AI reviewers disagree. One requests a speculative refactor despite passing acceptance tests.',
    risk: 'Unnecessary changes increase scope and introduce regression risk.',
    checks: ['Inspect acceptance criteria', 'Reproduce claimed defects', 'Reject unsupported findings']
  }
];

const agents = [
  ['01', 'ORCHESTRATOR', 'Scope / Context'],
  ['02', 'ARCHITECT', 'Design / Tradeoffs'],
  ['03', 'IMPLEMENTER', 'Proposed Change'],
  ['04', 'REVIEWER', 'Critical Analysis'],
  ['05', 'VALIDATOR', 'Evidence Gate']
];

export default function MissionControl() {
  const [selected, setSelected] = useState(0);
  const [inspected, setInspected] = useState(false);
  const [decision, setDecision] = useState<'verify' | 'bypass' | null>(null);
  const [step, setStep] = useState(0);

  const mission = missions[selected];
  const completed = decision !== null && step === agents.length;

  const reset = (index = selected) => {
    setSelected(index);
    setInspected(false);
    setDecision(null);
    setStep(0);
  };

  const trace = [
    'Task scoped and assigned.',
    'Architect identifies critical assumptions.',
    'Implementation proposed for review.',
    inspected ? 'Human reviewed the assumptions.' : 'Human inspection omitted.',
    decision === 'verify'
      ? 'Verification required before release.'
      : 'Verification bypassed. Risk remains unresolved.'
  ];

  return (
    <section id="mission-control" className="mc">
      <style>{`
        .mc{--line:#293c50;--cyan:#66e7f3;--muted:#8ea7b9;background:#080f19;color:#e6f1f8;padding:75px max(24px,calc((100% - 1180px)/2));font-family:ui-monospace,monospace;border-top:1px solid var(--line)}
        .mc *{box-sizing:border-box}
        .mc button{cursor:pointer;font:inherit;border-radius:0;text-align:left}
        .mc button:focus-visible{outline:2px solid var(--cyan);outline-offset:3px}
        .mc-bar{display:flex;justify-content:space-between;border-bottom:1px solid var(--line);padding-bottom:18px;color:var(--cyan);font-size:11px;letter-spacing:2px}
        .mc h2{font-size:clamp(40px,7vw,90px);letter-spacing:-5px;line-height:1;margin:45px 0 20px;font-weight:700}
        .mc h2 span{color:var(--cyan)}
        .mc-intro{max-width:760px;color:var(--muted);line-height:1.8;font-family:system-ui,sans-serif}
        .mc-layout{display:grid;grid-template-columns:310px minmax(0,1fr);border:1px solid var(--line);margin-top:44px}
        .mc-side{border-right:1px solid var(--line);background:#0d1927}
        .mc-heading{padding:18px 20px;color:var(--cyan);font-size:11px;letter-spacing:1.5px;border-bottom:1px solid var(--line)}
        .mc-choice{display:block;width:100%;background:transparent;color:#b0c5d5;border:0;border-bottom:1px solid var(--line);padding:23px 20px}
        .mc-choice small{display:block;font-size:10px;letter-spacing:1px;color:var(--muted);margin-bottom:10px}
        .mc-choice strong{font-size:13px;letter-spacing:1px}
        .mc-choice.active{background:#153246;color:white;box-shadow:inset 3px 0 var(--cyan)}
        .mc-choice:hover{background:#162c3d}
        .mc-brief{padding:25px 20px;color:#cad9e5;line-height:1.8;font-size:13px}
        .mc-risk{margin-top:20px;border-left:2px solid #d7a668;padding-left:12px;color:#e6c39b}
        .mc-main{min-width:0;padding:28px;background:linear-gradient(145deg,#101f30,#0a1421)}
        .mc-label{font-size:11px;color:var(--cyan);letter-spacing:1.6px}
        .mc-network{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:27px 0}
        .mc-agent{min-height:105px;padding:18px 12px;border:1px solid #34536a;background:#102337;position:relative}
        .mc-agent:nth-child(1){grid-column:1/-1;border-color:var(--cyan)}
        .mc-agent:nth-child(5){grid-column:2/3}
        .mc-agent small{color:var(--cyan);display:block;font-size:10px}
        .mc-agent strong{display:block;font-size:11px;letter-spacing:.5px;margin:12px 0}
        .mc-agent em{font-style:normal;color:var(--muted);font-size:10px}
        .mc-agent.current{box-shadow:inset 0 0 0 1px var(--cyan),0 0 25px #25b7da20}
        .mc-gate{border-top:1px solid var(--line);padding-top:25px}
        .mc-gate h3{font-family:system-ui,sans-serif;font-size:21px;letter-spacing:-.5px}
        .mc-gate p{color:var(--muted);font-size:12px;line-height:1.8}
        .mc-controls{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
        .mc-controls button,.mc-next{padding:13px 16px;background:#0d2232;color:#c7eaf6;border:1px solid #426580;font-size:11px;letter-spacing:.4px}
        .mc-controls button:hover,.mc-next:hover{border-color:var(--cyan)}
        .mc-controls .mc-primary{background:var(--cyan);color:#08131c;border-color:var(--cyan);font-weight:bold}
        .mc-controls button:disabled{opacity:.4;cursor:not-allowed}
        .mc-checks{padding:15px 20px;background:#0c2631;border-left:2px solid var(--cyan);font-size:12px;line-height:2}
        .mc-bottom{display:grid;grid-template-columns:1.5fr 1fr;gap:20px;margin-top:20px}
        .mc-panel{border:1px solid var(--line);padding:25px;background:#0e1b29;min-width:0}
        .mc-trace{list-style:none;padding:0;margin:20px 0;color:#b8ccdc;font-size:12px;line-height:1.6}
        .mc-trace li{border-bottom:1px solid var(--line);padding:12px 0;display:flex;gap:14px}
        .mc-trace b{color:var(--cyan)}
        .mc-status{font-size:21px;font-weight:bold;letter-spacing:-.5px;margin:25px 0 15px}
        .mc-panel p{font-size:12px;color:var(--muted);line-height:1.8}
        .mc-footer{margin-top:24px;color:#7894a8;font-size:10px;letter-spacing:1px}
        @media(max-width:800px){.mc-layout,.mc-bottom{grid-template-columns:1fr}.mc-side{border-right:0;border-bottom:1px solid var(--line)}}
        @media(max-width:480px){.mc{padding:50px 18px}.mc h2{letter-spacing:-2px}.mc-main{padding:17px}.mc-network{grid-template-columns:repeat(2,minmax(0,1fr))}.mc-agent:nth-child(1){grid-column:1/-1}.mc-agent:nth-child(5){grid-column:auto}.mc-agent strong{overflow-wrap:anywhere}}
        @media(prefers-reduced-motion:reduce){.mc *{scroll-behavior:auto!important;transition:none!important}}
      `}</style>

      <div className="mc-bar">
        <span>04 / AI SYSTEMS LAB</span>
        <span>OFFLINE SIMULATION</span>
      </div>

      <h2>MISSION <span>CONTROL.</span></h2>
      <p className="mc-intro">
        Five agent roles. Three engineering missions.
        One accountable decision-maker. Explore what happens
        when AI-generated proposals encounter engineering scrutiny.
      </p>

      <div className="mc-layout">
        <aside className="mc-side">
          <div className="mc-heading">01 / SELECT MISSION</div>
          {missions.map((item, index) => (
            <button
              key={item.title}
              className={`mc-choice ${selected === index ? 'active' : ''}`}
              onClick={() => reset(index)}
              aria-pressed={selected === index}
            >
              <small>0{index + 1} / {item.classification}</small>
              <strong>{item.title}</strong>
            </button>
          ))}
          <div className="mc-brief">
            <div className="mc-label">MISSION BRIEF</div>
            <p>{mission.problem}</p>
            <div className="mc-risk">{mission.risk}</div>
          </div>
        </aside>

        <div className="mc-main">
          <div className="mc-label">AGENT TOPOLOGY / FIVE ROLES</div>
          <div className="mc-network">
            {agents.map(([number, name, purpose], index) => (
              <div
                key={name}
                className={`mc-agent ${step === index && decision ? 'current' : ''}`}
              >
                <small>NODE / {number}</small>
                <strong>{name}</strong>
                <em>{purpose}</em>
              </div>
            ))}
          </div>

          <div className="mc-gate">
            <div className="mc-label">02 / HUMAN DECISION GATE</div>
            <h3>Ship the proposal or require evidence?</h3>
            <p>
              Inspect the agent assumptions, then choose a verification
              strategy. These scenarios are illustrative, not actual
              AI model executions.
            </p>

            {inspected && (
              <div className="mc-checks">
                {mission.checks.map((check, index) => (
                  <div key={check}>{index + 1}. {check}</div>
                ))}
              </div>
            )}

            <div className="mc-controls">
              <button onClick={() => setInspected(!inspected)}>
                {inspected ? '✓ INSPECTED' : '↗ INSPECT ASSUMPTIONS'}
              </button>
              <button
                className="mc-primary"
                disabled={!inspected}
                onClick={() => { setDecision('verify'); setStep(0); }}
              >
                REQUIRE VERIFICATION
              </button>
              <button onClick={() => { setDecision('bypass'); setStep(0); }}>
                BYPASS CHECKS
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mc-bottom">
        <div className="mc-panel">
          <div className="mc-label">03 / EXECUTION TRACE</div>
          <ol className="mc-trace" aria-live="polite">
            {decision ? trace.slice(0, step).map((line, index) => (
              <li key={index}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <span>{line}</span>
              </li>
            )) : <li>Awaiting human decision.</li>}
          </ol>
          {decision && !completed && (
            <button className="mc-next" onClick={() => setStep(s => Math.min(5, s + 1))}>
              ADVANCE EXECUTION ↗
            </button>
          )}
        </div>
        <div className="mc-panel">
          <div className="mc-label">04 / OUTCOME ANALYSIS</div>
          <div className="mc-status">
            {!completed ? 'AWAITING EVIDENCE' :
              decision === 'verify' ? 'GATED / CONDITIONAL' :
              'UNVERIFIED / RISK EXPOSED'}
          </div>
          <p>
            {!completed
              ? 'Complete the workflow to inspect the consequences.'
              : decision === 'verify'
                ? 'The proposal requires verification before release. No real tests have been executed.'
                : mission.risk}
          </p>
          <button className="mc-next" onClick={() => reset()}>
            ↺ RESET MISSION
          </button>
        </div>
      </div>

      <div className="mc-footer">
        SIMULATED AGENTS / SYNTHETIC EVENTS / NO LIVE AI / NO API CHARGES
      </div>
    </section>
  );
}
