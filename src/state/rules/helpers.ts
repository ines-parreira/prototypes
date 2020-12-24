import _trim from 'lodash/trim'
import _compact from 'lodash/compact'
import {Map} from 'immutable'

import {toImmutable, isImmutable} from '../../utils'

import {Rule} from './types'

/**
 * Return array of event types of a rule (ex: ['ticket-updated', 'ticket-created'])
 */
export const eventTypes = (rule: Rule): Array<string> => {
    const ruleMap = toImmutable<Map<any, any>>(rule)

    // if not an immutable map
    if (!isImmutable(ruleMap)) {
        //@ts-ignore this edge-case should not be handle at this level
        return ruleMap
    }

    const types = (ruleMap.get('event_types') as string) || ''

    return _compact(types.split(',').map((t) => _trim(t)))
}

/**
 * Return array of overlapping strings in two string arrays (ex: ['ticket-updated', 'ticket-created']
 * and ['ticket-updated', 'ticket-assigned'] -> ['ticket-updated'])
 */
export const getArraysIntersection = (
    array1: Array<string>,
    array2: Array<string>
) => {
    return array1.filter((value) => array2.includes(value))
}
