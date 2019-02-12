//@flow
import _trim from 'lodash/trim'
import _compact from 'lodash/compact'

import {toImmutable, isImmutable} from '../../utils'

import type {ruleType} from './types'

/**
 * Return array of event types of a rule (ex: ['ticket-updated', 'ticket-created'])
 * @param rule
 * @returns {*}
 */
export const eventTypes = (rule: ruleType): Array<string> => {
    const ruleMap = toImmutable(rule)

    // if not an immutable map
    if (!isImmutable(ruleMap)) {
        return ruleMap
    }

    const types = ruleMap.get('event_types') || ''

    return _compact(types.split(',').map((t) => _trim(t)))
}
