import { Iterable } from 'immutable'

export function isImmutable(value: any): value is Iterable<unknown, unknown> {
    return Iterable.isIterable(value)
}
