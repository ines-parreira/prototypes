import Immutable from 'immutable'

/**
 * Return true if passed object is immutable (from Immutable JS)
 */
export default function isImmutable(value: any): boolean {
    return Immutable.Iterable.isIterable(value)
}
