import {List, Map} from 'immutable'

import {RuleType} from '../rule/types'

import {AuditLogEventType} from './types'

export const isSystemRuleEvent = (event: Map<any, any>): boolean =>
    event.getIn(['data', 'type']) === RuleType.System

export const isRuleExecutedType = (event: Map<any, any>): boolean =>
    event.get('type') === AuditLogEventType.RuleExecuted

export const isViaRuleEvent = (
    event: Map<any, any>,
    events: List<any>
): boolean =>
    (((event.get('context') as Map<any, any>) &&
        (events.find(
            (otherEvent: Map<any, any>) =>
                isRuleExecutedType(otherEvent) &&
                otherEvent.get('id') !== event.get('id') &&
                otherEvent.get('context') === event.get('context') &&
                otherEvent.get('created_datetime') <
                    event.get('created_datetime')
        ) as Maybe<Map<any, any>>)) as unknown) as boolean
