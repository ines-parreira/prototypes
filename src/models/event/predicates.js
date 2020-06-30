//@flow

import type {List, Record} from 'immutable'

import {RULE_EXECUTED} from '../../constants/event'

import {SYSTEM_RULE_TYPE} from './constants'

import type {AuditLogEvent} from './types'

export const isSystemRuleEvent = (event: Record<AuditLogEvent>): boolean =>
    event.getIn(['data', 'type']) === SYSTEM_RULE_TYPE

export const isRuleExecutedType = (event: Record<AuditLogEvent>): boolean =>
    event.get('type') === RULE_EXECUTED

export const isViaRuleEvent = (
    event: Record<AuditLogEvent>,
    events: List<Record<AuditLogEvent>>
): boolean =>
    event.get('context') &&
    events.find(
        (otherEvent) =>
            isRuleExecutedType(otherEvent) &&
            otherEvent.get('id') !== event.get('id') &&
            otherEvent.get('context') === event.get('context') &&
            otherEvent.get('created_datetime') < event.get('created_datetime')
    )
