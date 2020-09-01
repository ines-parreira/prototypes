import _trim from 'lodash/trim'
import _compact from 'lodash/compact'
import {Map} from 'immutable'

import {toImmutable, isImmutable} from '../../utils.js'

import {Rule} from './types'

/**
 * Return array of event types of a rule (ex: ['ticket-updated', 'ticket-created'])
 */
export const eventTypes = (rule: Rule): Array<string> => {
    const ruleMap = toImmutable(rule) as Map<any, any>

    // if not an immutable map
    if (!isImmutable(ruleMap)) {
        //@ts-ignore this edge-case should not be handle at this level
        return ruleMap
    }

    const types = (ruleMap.get('event_types') as string) || ''

    return _compact(types.split(',').map((t) => _trim(t)))
}
