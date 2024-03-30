export class AssertionError extends Error {}

export function assert(condition: unknown, msg: string): asserts condition {
    if (!condition) throw new AssertionError(msg);
}
