import { TicketThreadItemTag } from '../../../hooks/types'
import type { TicketThreadVirtualizedListItem } from '../utils'
import { composerItem, getThreadListItemKey, isComposerItem } from '../utils'

describe('TicketThreadContainer utils', () => {
    it('builds stable keys for grouped events, rule suggestions, datetime fallbacks, and generic fallbacks', () => {
        expect(
            getThreadListItemKey(
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
                4,
            ),
        ).toBe('grouped-events:ticket-event:first:ticket-event:last:1:0')
        expect(
            getThreadListItemKey(
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
                4,
            ),
        ).toBe('rule-suggestion:55:1:1')
        expect(
            getThreadListItemKey(
                {
                    _tag: TicketThreadItemTag.Events.GroupedEvents,
                    data: [],
                    datetime: '2024-03-21T11:00:00Z',
                },
                2,
                '1',
                4,
            ),
        ).toBe('grouped-events:2024-03-21T11:00:00Z:1:2')
        expect(
            getThreadListItemKey(
                {
                    _tag: TicketThreadItemTag.ContactReasonSuggestion,
                    data: {},
                } as unknown as TicketThreadVirtualizedListItem,
                0,
                undefined,
                1,
            ),
        ).toBe('contact-reason-suggestion:ticket:0')
        expect(
            getThreadListItemKey(
                {
                    _tag: TicketThreadItemTag.ContactReasonSuggestion,
                    data: null,
                },
                1,
                undefined,
                1,
            ),
        ).toBe('contact-reason-suggestion:ticket:1')
    })

    it('uses the ticket item count when building the composer key', () => {
        expect(getThreadListItemKey(composerItem, 2, '1', 4)).toBe(
            'composer:4:1',
        )
        expect(getThreadListItemKey(composerItem, 2, undefined, 4)).toBe(
            'composer:4:ticket',
        )
    })

    it('falls back to the tag and index when grouped items are empty', () => {
        const item = {
            _tag: TicketThreadItemTag.Events.GroupedEvents,
            data: [],
        } as unknown as TicketThreadVirtualizedListItem

        expect(getThreadListItemKey(item, 1, '1', 2)).toBe('grouped-events:1:1')
    })

    it('falls back when identifiers are missing or incomplete', () => {
        expect(
            getThreadListItemKey(
                {
                    _tag: TicketThreadItemTag.ContactReasonSuggestion,
                    data: 'not-an-object',
                } as unknown as TicketThreadVirtualizedListItem,
                0,
                '1',
                1,
            ),
        ).toBe('contact-reason-suggestion:1:0')

        expect(
            getThreadListItemKey(
                {
                    _tag: TicketThreadItemTag.RuleSuggestion,
                    data: {
                        id: null,
                        rule_suggestion: null,
                    },
                    datetime: '2024-03-21T11:00:00Z',
                } as unknown as TicketThreadVirtualizedListItem,
                1,
                '1',
                1,
            ),
        ).toBe('rule-suggestion:2024-03-21T11:00:00Z:1:1')

        expect(
            getThreadListItemKey(
                {
                    _tag: TicketThreadItemTag.RuleSuggestion,
                    data: {
                        rule_suggestion: {},
                    },
                    datetime: '2024-03-21T11:01:00Z',
                } as unknown as TicketThreadVirtualizedListItem,
                2,
                '1',
                1,
            ),
        ).toBe('rule-suggestion:2024-03-21T11:01:00Z:1:2')

        expect(
            getThreadListItemKey(
                {
                    _tag: TicketThreadItemTag.RuleSuggestion,
                    data: {
                        rule_suggestion: {
                            id: null,
                        },
                    },
                    datetime: '2024-03-21T11:02:00Z',
                } as unknown as TicketThreadVirtualizedListItem,
                3,
                '1',
                1,
            ),
        ).toBe('rule-suggestion:2024-03-21T11:02:00Z:1:3')
    })

    it('identifies composer items', () => {
        expect(isComposerItem(composerItem)).toBe(true)
        expect(
            isComposerItem({
                _tag: TicketThreadItemTag.Messages.Message,
                data: { id: 'message-1' } as any,
                datetime: '2024-03-21T11:00:00Z',
            }),
        ).toBe(false)
    })
})
