import { describe, expect, it } from 'vitest';
import { releaseVerdict, scenarios, type Assessment } from './scenarios';
const claims = scenarios[0].claims;
const documented = (kind: Assessment['kind']): Assessment => ({ kind, severity: 'info', rationale: 'Reviewed the contract', evidence: 'E1' });
describe('human release gate', () => {
  it('requires documentation for every claim even if a defect is recorded', () => {
    expect(releaseVerdict(claims, { C1: documented('defect') }).verdict).toBe('REVIEW INCOMPLETE');
  });
  it('rejects whitespace-only rationale and evidence', () => {
    for (const field of ['rationale', 'evidence']) expect(releaseVerdict(claims, Object.fromEntries(claims.map(c => [c.id, { ...documented('suggestion'), [field]: '  ' }]))).pending).toBe(3);
  });
  it('blocks confirmed defects even at informational severity', () => {
    expect(releaseVerdict(claims, { C1: documented('defect'), C2: documented('unsupported'), C3: documented('suggestion') }).verdict).toBe('REQUEST CHANGES');
  });
  it('holds unverified risk rather than implying release approval', () => {
    expect(releaseVerdict(claims, Object.fromEntries(claims.map(c => [c.id, documented('risk')]))).verdict).toBe('HOLD FOR VERIFICATION');
  });
  it('leaves final approval to a human when only suggestions and unsupported claims remain', () => {
    expect(releaseVerdict(claims, { C1: documented('suggestion'), C2: documented('unsupported'), C3: documented('suggestion') }).verdict).toBe('READY FOR HUMAN APPROVAL');
  });
});
