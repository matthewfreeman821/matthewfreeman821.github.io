export type ReservationState = { available: number; reads: Partial<Record<'A' | 'B', number>>; results: Partial<Record<'A' | 'B', string>>; log: string[]; step: number };
export const freshReservation = (): ReservationState => ({ available: 1, reads: {}, results: {}, log: [], step: 0 });
// Deliberately small executable model, not a database/driver emulation.
// Both schedules start with one unit and two requests for one unit.
export function advanceReservation(state: ReservationState, guarded: boolean): ReservationState {
  if (state.step >= 4) return state;
  const next = { ...state, reads: { ...state.reads }, results: { ...state.results }, log: [...state.log], step: state.step + 1 };
  const actor = state.step % 2 === 0 ? 'A' : 'B';
  if (state.step < 2) {
    next.reads[actor] = state.available;
    next.log.push(`${actor} reads ${state.available} available; request quantity = 1.`);
  } else if ((guarded ? state.available : state.reads[actor] ?? 0) >= 1) {
    next.available -= 1; next.results[actor] = 'reserved';
    next.log.push(`${actor} ${guarded ? 'checks current stock and commits atomically' : 'trusts its earlier read and commits'} → ${next.available} available.`);
  } else {
    next.results[actor] = 'conflict'; next.log.push(`${actor} receives a conflict; stock stays ${next.available}.`);
  }
  return next;
}
