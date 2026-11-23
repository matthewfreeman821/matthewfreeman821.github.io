import { useState } from 'react';
import { advanceReservation, freshReservation } from './reservation-model';

export default function ReservationTrace() {
  const [guarded, setGuarded] = useState(false);
  const [state, setState] = useState(freshReservation);
  return <div className="lab-trace">
    <div><span className="lab-label">EXECUTABLE COUNTEREXAMPLE / ONE UNIT · TWO REQUESTS</span><h4>Schedule the collision.</h4><p>Step through a deliberately adverse interleaving, then compare the atomic guard. This browser model executes JavaScript state transitions; it does not execute SQL or prove a database implementation correct.</p></div>
    <div className="lab-scenarios"><button aria-pressed={!guarded} onClick={() => { setGuarded(false); setState(freshReservation()); }}>Proposed split check/write</button><button aria-pressed={guarded} onClick={() => { setGuarded(true); setState(freshReservation()); }}>Atomic conditional update</button></div>
    <div className="lab-trace-status" aria-live="polite"><div><span>AVAILABLE STOCK</span><strong>{state.available}</strong></div><div><span>REQUEST A</span><strong>{state.results.A ?? (state.reads.A === undefined ? 'waiting' : 'read 1')}</strong></div><div><span>REQUEST B</span><strong>{state.results.B ?? (state.reads.B === undefined ? 'waiting' : 'read 1')}</strong></div><div><span>STOCK INVARIANT</span><strong>{state.available < 0 ? 'VIOLATED' : 'HOLDS SO FAR'}</strong></div></div>
    <ol className="lab-trace-log" aria-live="polite">{state.log.map((entry, i) => <li key={i}>{entry}</li>)}</ol>
    <div className="lab-trace-actions"><button disabled={state.step === 4} onClick={() => setState(s => advanceReservation(s, guarded))}>{state.step === 4 ? 'Trace complete' : `Advance interleaving · ${state.step}/4`}</button><button onClick={() => setState(freshReservation())}>Reset trace</button></div>
  </div>;
}
