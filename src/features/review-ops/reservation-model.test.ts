import { expect, it } from 'vitest';
import { advanceReservation, freshReservation } from './reservation-model';
it('demonstrates two successes and overselling after the same stale read', () => {
  let state = freshReservation();
  for (let i = 0; i < 4; i++) state = advanceReservation(state, false);
  expect(state.available).toBe(-1); expect(state.results).toEqual({ A: 'reserved', B: 'reserved' });
});
it('conditional update permits only one winner for the same schedule', () => {
  let state = freshReservation();
  for (let i = 0; i < 4; i++) state = advanceReservation(state, true);
  expect(state.available).toBe(0); expect(state.results).toEqual({ A: 'reserved', B: 'conflict' });
  expect(advanceReservation(state, true)).toBe(state);
});
it('does not mutate prior snapshots', () => {
  const start = freshReservation(); advanceReservation(start, false);
  expect(start).toEqual(freshReservation());
});
