import {toImmutable, isImmutable} from '../../utils'
import _trim from 'lodash/trim'
import _compact from 'lodash/compact'

/**
 * Return array of event types of a rule (ex: ['ticket-updated', 'ticket-created'])
 * @param rule
 * @returns {*}
 */
export const eventTypes = (rule) => {
    rule = toImmutable(rule)

    // if not an immutable map
    if (!isImmutable(rule)) {
        return rule
    }

    const types = rule.get('event_types') || ''

    return _compact(types.split(',').map(_trim))
}
