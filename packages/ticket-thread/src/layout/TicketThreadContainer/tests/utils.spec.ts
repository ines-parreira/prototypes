import { TicketThreadItemTag } from '../../../hooks/types'
import { getThreadItemKey } from '../utils'

describe('TicketThreadContainer utils', () => {
    it('builds stable keys for grouped events, rule suggestions, datetime fallbacks, and generic fallbacks', () => {
        expect(
            getThreadItemKey(
                {
                    _tag: TicketThreadItemTag.Events.GroupedEvents,
                    data: [
                        {
                            _tag: TicketThreadItemTag.Events.TicketEvent,
                            data: { id: 'first' } as any,
                            datetime: '2024-03-21T11:00:00Z',
                        },
                        {
                            _tag: TicketThreadItemTag.Events.TicketEvent,
                            data: { id: 'last' } as any,
                            datetime: '2024-03-21T11:01:00Z',
                        },
                    ],
                    datetime: '2024-03-21T11:02:00Z',
                },
                0,
                '1',
            ),
        ).toBe('grouped-events:ticket-event:first:ticket-event:last:1')
        expect(
            getThreadItemKey(
                {
                    _tag: TicketThreadItemTag.RuleSuggestion,
                    data: {
                        rule_suggestion: {
                            id: 55,
                        },
                    },
                },
                1,
                '1',
            ),
        ).toBe('rule-suggestion:55:1')
        expect(
            getThreadItemKey(
                {
                    _tag: TicketThreadItemTag.Events.GroupedEvents,
                    data: [],
                    datetime: '2024-03-21T11:00:00Z',
                },
                2,
                '1',
            ),
        ).toBe('grouped-events:2024-03-21T11:00:00Z:1')
        expect(
            getThreadItemKey(
                {
                    _tag: TicketThreadItemTag.ContactReasonSuggestion,
                    data: {},
                },
                0,
                undefined,
            ),
        ).toBe('contact-reason-suggestion:ticket:0')
        expect(
            getThreadItemKey(
                {
                    _tag: TicketThreadItemTag.ContactReasonSuggestion,
                    data: null,
                },
                1,
                undefined,
            ),
        ).toBe('contact-reason-suggestion:ticket:1')
    })

    it('keeps identified item keys stable when their index changes', () => {
        const item = {
            _tag: TicketThreadItemTag.Messages.Message,
            data: { id: 'message-1' } as any,
            datetime: '2024-03-21T11:00:00Z',
        } as const

        expect(getThreadItemKey(item, 0, '1')).toBe('message:message-1:1')
        expect(getThreadItemKey(item, 1, '1')).toBe('message:message-1:1')
    })
    it('falls back to the tag and index when grouped items are empty', () => {
        const item = {
            _tag: TicketThreadItemTag.Events.GroupedEvents,
            data: [],
        }

        expect(getThreadItemKey(item, 1, '1')).toBe('grouped-events:1:1')
    })

    it('falls back when identifiers are missing or incomplete', () => {
        expect(
            getThreadItemKey(
                {
                    _tag: TicketThreadItemTag.ContactReasonSuggestion,
                    data: 'not-an-object',
                },
                0,
                '1',
            ),
        ).toBe('contact-reason-suggestion:1:0')

        expect(
            getThreadItemKey(
                {
                    _tag: TicketThreadItemTag.RuleSuggestion,
                    data: {
                        id: null,
                        rule_suggestion: null,
                    },
                    datetime: '2024-03-21T11:00:00Z',
                },
                1,
                '1',
            ),
        ).toBe('rule-suggestion:2024-03-21T11:00:00Z:1')

        expect(
            getThreadItemKey(
                {
                    _tag: TicketThreadItemTag.RuleSuggestion,
                    data: {
                        rule_suggestion: {},
                    },
                    datetime: '2024-03-21T11:01:00Z',
                },
                2,
                '1',
            ),
        ).toBe('rule-suggestion:2024-03-21T11:01:00Z:1')

        expect(
            getThreadItemKey(
                {
                    _tag: TicketThreadItemTag.RuleSuggestion,
                    data: {
                        rule_suggestion: {
                            id: null,
                        },
                    },
                    datetime: '2024-03-21T11:02:00Z',
                },
                3,
                '1',
            ),
        ).toBe('rule-suggestion:2024-03-21T11:02:00Z:1')
    })
})
