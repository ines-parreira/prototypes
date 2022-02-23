import {List, Map} from 'immutable'

import {SYSTEM_RULE_TYPE} from './constants'
import {TICKET_EVENT_TYPES} from './types'

export const isSystemRuleEvent = (event: Map<any, any>): boolean =>
    event.getIn(['data', 'type']) === SYSTEM_RULE_TYPE

export const isRuleExecutedType = (event: Map<any, any>): boolean =>
    event.get('type') === TICKET_EVENT_TYPES.RuleExecuted

export const isViaRuleEvent = (
    event: Map<any, any>,
    events: List<any>
): boolean =>
    ((event.get('context') as Map<any, any>) &&
        (events.find(
            (otherEvent: Map<any, any>) =>
                isRuleExecutedType(otherEvent) &&
                otherEvent.get('id') !== event.get('id') &&
                otherEvent.get('context') === event.get('context') &&
                otherEvent.get('created_datetime') <
                    event.get('created_datetime')
        ) as Maybe<Map<any, any>>)) as unknown as boolean
