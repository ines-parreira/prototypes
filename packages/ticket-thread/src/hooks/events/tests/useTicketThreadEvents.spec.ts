import { renderHook } from '@testing-library/react'

import { ObjectType, useListEvents } from '@gorgias/helpdesk-queries'

import { useTicketThreadLegacyBridge } from '../../../utils/LegacyBridge'
import { TicketThreadItemTag } from '../../types'
import { useTicketThreadEvents } from '../useTicketThreadEvents'

vi.mock('@gorgias/helpdesk-queries', () => ({
    ObjectType: { Ticket: 'ticket' },
    useListEvents: vi.fn(),
}))

vi.mock('../../../utils/LegacyBridge', () => ({
    useTicketThreadLegacyBridge: vi.fn(),
}))

const mockUseListEvents = vi.mocked(useListEvents)
const mockUseTicketThreadLegacyBridge = vi.mocked(useTicketThreadLegacyBridge)

describe('useTicketThreadEvents', () => {
    beforeEach(() => {
        mockUseTicketThreadLegacyBridge.mockReturnValue({
            currentTicketShoppingAssistantData: {
                influencedOrders: [
                    {
                        id: 1001,
                        integrationId: 42,
                        ticketId: 7,
                        createdDatetime: '2024-01-01T11:00:00Z',
                        source: 'shopping-assistant',
                    },
                ],
                shopifyOrders: [{ id: 1001, order_number: 3001 }],
                shopifyIntegrations: [{ id: 42, name: 'Primary shop' }],
            },
            currentTicketRuleSuggestionData: {
                shouldDisplayDemoSuggestion: true,
            },
            datetimeFormat: 'MMM D, YYYY [at] h:mm A',
        })
    })

    it('applies legacy-equivalent event filtering and merges shopping assistant events', () => {
        mockUseListEvents.mockReturnValue({
            data: [
                {
                    object_type: 'ticket',
                    created_datetime: '2024-03-21T11:00:00Z',
                    type: 'satisfaction-survey-responded',
                    data: {},
                },
                {
                    object_type: 'ticket',
                    created_datetime: '2024-03-21T11:01:00Z',
                    type: 'ticket-updated',
                    data: {
                        action_name: 'facebookPrivateReply',
                        payload: {
                            private_reply_event_type:
                                'MessagingTicketPrivateReplyEvent',
                        },
                    },
                },
                {
                    object_type: 'ticket',
                    created_datetime: '2024-03-21T11:02:00Z',
                    type: 'ticket-updated',
                    data: {
                        action_name: 'facebookPrivateReply',
                        payload: {
                            private_reply_event_type:
                                'MessagingTicketPrivateReplyEvent',
                        },
                        facebook_comment_ticket_id: '99',
                    },
                },
                {
                    object_type: 'ticket',
                    created_datetime: '2024-03-21T11:03:00Z',
                    type: 'ticket-updated',
                    data: {},
                },
                {
                    object_type: 'ticket',
                    created_datetime: '2024-03-21T11:04:00Z',
                    type: 'ticket-updated',
                    data: {
                        action_name: 'setStatus',
                    },
                },
            ],
        } as any)

        const { result } = renderHook(() =>
            useTicketThreadEvents({ ticketId: 7 }),
        )

        // Legacy parity:
        // - non-renderable private reply events are removed
        // - deprecated private reply events remain renderable
        // - synthetic shopping-assistant events are merged in the timeline
        expect(result.current.events.map((event) => event._tag)).toEqual([
            TicketThreadItemTag.Events.SatisfactionSurveyRespondedEvent,
            TicketThreadItemTag.Events.PrivateReplyEvent,
            TicketThreadItemTag.Events.TicketEvent,
            TicketThreadItemTag.Events.ShoppingAssistantEvent,
        ])
        expect(result.current.hasSatisfactionSurveyRespondedEvent).toBe(true)

        expect(mockUseListEvents).toHaveBeenCalledWith(
            {
                object_id: 7,
                object_type: ObjectType.Ticket,
            },
            expect.any(Object),
        )
    })

    it('returns empty events and false survey flag when no event source exists', () => {
        mockUseListEvents.mockReturnValue({ data: [] } as any)
        mockUseTicketThreadLegacyBridge.mockReturnValue({
            currentTicketShoppingAssistantData: {
                influencedOrders: [],
                shopifyOrders: [],
                shopifyIntegrations: [],
            },
            currentTicketRuleSuggestionData: {
                shouldDisplayDemoSuggestion: true,
            },
            datetimeFormat: 'MMM D, YYYY [at] h:mm A',
        })

        const { result } = renderHook(() =>
            useTicketThreadEvents({ ticketId: 999 }),
        )

        expect(result.current.events).toEqual([])
        expect(result.current.hasSatisfactionSurveyRespondedEvent).toBe(false)
    })
})
