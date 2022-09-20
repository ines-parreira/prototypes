import {fromJS, Map} from 'immutable'

import {TicketEventType, TICKET_EVENT_TYPES} from 'models/event/types'
import {SYSTEM_RULE_TYPE} from 'models/event/constants'

import {
    isRuleExecutedType,
    isSystemRuleEvent,
    isViaRuleEvent,
} from '../predicates'

describe('Event predicates', () => {
    describe('isSystemRuleEvent()', () => {
        it('should return true', () => {
            const event = fromJS({
                data: {
                    type: SYSTEM_RULE_TYPE,
                },
            })

            expect(isSystemRuleEvent(event)).toBe(true)
        })

        it('should return false', () => {
            const event = fromJS({
                data: {
                    type: 'foo',
                },
            })

            expect(isSystemRuleEvent(event)).toBe(false)
        })
    })

    describe('isRuleExecutedType()', () => {
        it('should return true', () => {
            const event = fromJS({
                type: TICKET_EVENT_TYPES.RuleExecuted,
            })

            expect(isRuleExecutedType(event)).toBe(true)
        })

        it('should return false', () => {
            const event = fromJS({
                type: TICKET_EVENT_TYPES.TicketAssigned,
            })

            expect(isRuleExecutedType(event)).toBe(false)
        })
    })

    describe('isViaRuleEvent()', () => {
        const getEvent = (eventType: TicketEventType) =>
            fromJS({
                id: 1,
                account_id: 1,
                user_id: null,
                object_type: 'Ticket',
                object_id: 1,
                data: null,
                context: 'foo',
                type: eventType,
                created_datetime: '2019-11-15 19:00:00.000000',
            }) as Map<any, any>

        const getValidEvent = () =>
            getEvent(TICKET_EVENT_TYPES.TicketAssigned)
                .set('id', 2)
                .set('created_datetime', '2019-11-15 19:00:00.500000')

        it('should return truthy value', () => {
            const ruleExecutedEvent = getEvent(TICKET_EVENT_TYPES.RuleExecuted)
            const event = getValidEvent()
            const events = fromJS([ruleExecutedEvent, event])
            expect(isViaRuleEvent(event, events)).toBeTruthy()
        })

        describe('should return falsy value', () => {
            it('because the context is empty', () => {
                const ruleExecutedEvent = getEvent(
                    TICKET_EVENT_TYPES.RuleExecuted
                )
                const event = getValidEvent().set('context', '')
                const events = fromJS([ruleExecutedEvent, event])
                expect(isViaRuleEvent(event, events)).toBeFalsy()
            })

            it('because the context is null', () => {
                const ruleExecutedEvent = getEvent(
                    TICKET_EVENT_TYPES.RuleExecuted
                )
                const event = getValidEvent().set('context', null)
                const events = fromJS([ruleExecutedEvent, event])
                expect(isViaRuleEvent(event, events)).toBeFalsy()
            })

            it('because the events array is empty', () => {
                const event = getValidEvent()
                const events = fromJS([])
                expect(isViaRuleEvent(event, events)).toBeFalsy()
            })

            it('because there is no other event in the events array', () => {
                const event = getValidEvent()
                const events = fromJS([event])
                expect(isViaRuleEvent(event, events)).toBeFalsy()
            })

            it('because there is no "rule executed" event in the events array', () => {
                const otherEvent = getEvent(TICKET_EVENT_TYPES.TicketAssigned)
                const event = getValidEvent()
                const events = fromJS([otherEvent, event])
                expect(isViaRuleEvent(event, events)).toBeFalsy()
            })

            it('because there is only the "rule executed" event in the events array', () => {
                const ruleExecutedEvent = getEvent(
                    TICKET_EVENT_TYPES.RuleExecuted
                )
                const events = fromJS([ruleExecutedEvent])
                expect(isViaRuleEvent(ruleExecutedEvent, events)).toBeFalsy()
            })

            it('because the context is different', () => {
                const ruleExecutedEvent = getEvent(
                    TICKET_EVENT_TYPES.RuleExecuted
                ).set('context', 'bar')
                const event = getValidEvent()
                const events = fromJS([ruleExecutedEvent, event])
                expect(isViaRuleEvent(event, events)).toBeFalsy()
            })

            it('because the event has a user_id', () => {
                const ruleExecutedEvent = getEvent(
                    TICKET_EVENT_TYPES.RuleExecuted
                )
                const event = getValidEvent().set('user_id', '1')
                const events = fromJS([ruleExecutedEvent, event])
                expect(isViaRuleEvent(event, events)).toBeFalsy()
            })
        })
    })
})
