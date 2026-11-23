export type Classification = 'defect' | 'risk' | 'suggestion' | 'unsupported';
export type Assessment = { kind: Classification; severity: 'high' | 'medium' | 'low' | 'info'; rationale: string; evidence: string };
export type Claim = { id: string; reviewer: string; title: string; claim: string; reference: string; expected: Classification; explanation: string };
export type Scenario = { id: string; title: string; summary: string; file: string; criteria: string[]; before: string[]; after: string[]; evidence: { id: string; title: string; body: string }[]; claims: Claim[] };

export const scenarios: Scenario[] = [
  {
    id: 'reservation', title: 'The last unit', summary: 'PR #184 · Replace a guarded stock update with a service-layer availability check. The happy path looks equivalent. Concurrent requests tell a different story.',
    file: 'src/inventory/reserve.ts',
    criteria: ['Never reserve more units than are available.', 'Reject quantities that are not positive integers.', 'Return a conflict when stock is exhausted.'],
    before: ['export async function reserve(db, sku, qty) {', '  assertPositiveInteger(qty);', '  const result = await db.execute(', '    "UPDATE stock SET available = available - ? WHERE sku = ? AND available >= ?",', '    [qty, sku, qty]', '  );', '  if (result.changes !== 1) throw new Conflict();', '}'],
    after: ['export async function reserve(db, sku, qty) {', '  assertPositiveInteger(qty);', '  const row = await db.get("SELECT available FROM stock WHERE sku = ?", [sku]);', '  if (!row || row.available < qty) throw new Conflict();', '  await db.execute(', '    "UPDATE stock SET available = available - ? WHERE sku = ?",', '    [qty, sku]', '  );', '}'],
    evidence: [
      { id: 'E1', title: 'Permitted interleaving', body: 'Initial available = 1. A reads 1; B reads 1; A validates; B validates; A updates to 0; B updates to −1. Both requests return success. No transaction encloses the read and write. This is a reasoned counterexample, not an executed database test.' },
      { id: 'E2', title: 'Validation boundary', body: 'The unchanged assertPositiveInteger helper rejects zero, negatives, fractions, NaN, and non-numbers before either database call. Its contract is provided as a fictional scenario assumption.' },
      { id: 'E3', title: 'Scope of the evidence', body: 'The SQL and parameters are passed separately through the database driver. There is no string interpolation. This PR contains no network-service or retry-policy change.' }
    ],
    claims: [
      { id: 'C1', reviewer: 'Concurrency reviewer · HIGH', title: 'Check and write can oversell', claim: 'Two requests may each validate the final unit, then both decrement it. Restore an atomic predicate and inspect the affected-row count.', reference: 'L3–8 · E1', expected: 'defect', explanation: 'E1 supplies a counterexample to the first acceptance criterion. HIGH is defensible for lost inventory integrity; reviewer count adds no proof.' },
      { id: 'C2', reviewer: 'Security reviewer · HIGH', title: 'SQL injection through sku', claim: 'The incoming SKU is inserted into the stock query, so an attacker can change the SQL.', reference: 'L3, L6–7 · E3', expected: 'unsupported', explanation: 'The driver receives bound parameters. This snippet does not support an injection claim; reject it without claiming the entire system is secure.' },
      { id: 'C3', reviewer: 'Maintainability reviewer · LOW', title: 'Extract the SQL into a named constant', claim: 'A descriptive query name could make the service easier to scan. It does not change reservation behavior.', reference: 'L5–8', expected: 'suggestion', explanation: 'A readability preference is not a release-blocking defect. Keep it separate from the data-integrity failure.' }
    ]
  },
  {
    id: 'cache', title: 'Fast, for the wrong account', summary: 'PR #219 · Cache an account summary to reduce repeated database work. Review the identity boundary and the freshness contract before accepting the performance change.',
    file: 'src/accounts/summary.ts',
    criteria: ['Every response belongs to the authenticated account.', 'Balance changes appear within 30 seconds.', 'Only authenticated requests can reach this handler.'],
    before: ['export async function summary(req, db) {', '  const account = req.auth.accountId;', '  return db.summaryFor(account);', '}'],
    after: ['export async function summary(req, db, cache) {', '  const account = req.auth.accountId;', '  const key = "account-summary";', '  const hit = await cache.get(key);', '  if (hit) return JSON.parse(hit);', '  const result = await db.summaryFor(account);', '  await cache.set(key, JSON.stringify(result), { ttlSeconds: 300 });', '  return result;', '}'],
    evidence: [
      { id: 'E1', title: 'Cross-account counterexample', body: 'Account A fills account-summary. Account B requests a summary before expiry and receives A’s cached result at L5. The shared cache has no per-account namespace. This is a reasoned counterexample, not a live Redis execution.' },
      { id: 'E2', title: 'Freshness contract', body: 'The cache adapter interprets ttlSeconds in seconds. There is no balance-change invalidation in this scenario. A change immediately after a fill can remain invisible for almost 300 seconds, exceeding the 30-second requirement.' },
      { id: 'E3', title: 'Router boundary and remaining uncertainty', body: 'The fictional router applies requireAuthenticatedAccount before calling summary and supplies req.auth.accountId. Cache outage behavior and real traffic patterns are not supplied. An outage risk needs a failure-policy decision and verification.' }
    ],
    claims: [
      { id: 'C1', reviewer: 'Security reviewer · HIGH', title: 'Cache key crosses account boundaries', claim: 'A constant shared key returns one account’s summary to another. Key by the trusted account identity and test two accounts.', reference: 'L3–5 · E1', expected: 'defect', explanation: 'E1 violates account isolation directly. Use an account-scoped key; authentication alone does not isolate cache entries.' },
      { id: 'C2', reviewer: 'Performance reviewer · MEDIUM', title: 'TTL violates freshness', claim: 'Five-minute caching is acceptable because it reduces database traffic.', reference: 'L7 · E2', expected: 'defect', explanation: 'Reject the recommendation to accept this TTL. E2 contradicts the explicit 30-second contract. Faster responses cannot justify silently changing correctness requirements.' },
      { id: 'C3', reviewer: 'Reliability reviewer · MEDIUM', title: 'Cache outage could become an outage', claim: 'Consider a bounded timeout and explicit fallback policy. The adapter’s failure behavior is absent, so a user-visible failure is not yet demonstrated.', reference: 'L4, L7 · E3', expected: 'risk', explanation: 'A plausible failure mode with incomplete evidence is a risk to investigate, not a reproduced defect. Decide and test the failure policy.' }
    ]
  }
];

export function releaseVerdict(claims: Claim[], decisions: Record<string, Assessment>) {
  const pending = claims.filter(c => !decisions[c.id]?.rationale.trim() || !decisions[c.id]?.evidence.trim());
  const defects = claims.filter(c => decisions[c.id]?.kind === 'defect');
  const risks = claims.filter(c => decisions[c.id]?.kind === 'risk');
  return { pending: pending.length, defects: defects.length, risks: risks.length,
    verdict: pending.length ? 'REVIEW INCOMPLETE' : defects.length ? 'REQUEST CHANGES' : risks.length ? 'HOLD FOR VERIFICATION' : 'READY FOR HUMAN APPROVAL' };
}
