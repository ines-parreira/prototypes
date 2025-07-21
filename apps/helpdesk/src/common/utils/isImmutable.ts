import { Iterable } from 'immutable'

export default function isImmutable(
    value: any,
): value is Iterable<unknown, unknown> {
    return Iterable.isIterable(value)
}
