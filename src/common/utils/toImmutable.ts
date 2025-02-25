import { Iterable } from 'immutable'

import fromAST from './fromAST'
import isImmutable from './isImmutable'

/**
 * Return a passed object as immutable
 */
export default function toImmutable<T, U = Record<string, unknown>>(
    object: U | Iterable<any, any> | unknown[],
) {
    return (isImmutable(object) ? object : fromAST(object)) as T
}
