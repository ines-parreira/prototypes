import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockEvent,
    mockListEventsHandler,
    mockListEventsResponse,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { TicketThreadItemTag } from '../../types'
import type { TicketThreadAuditLogEventItem } from '../types'
import { useTicketThreadEvents } from '../useTicketThreadEvents'

type AuditLogEventParams = {
    id: number
    type:
        | 'rule-executed'
        | 'rule-suggestion-suggested'
        | 'ticket-assigned'
        | 'ticket-closed'
    created_datetime: string
    context?: string | null
    user_id?: number | null
    data?: Record<string, unknown> | null
}

const shoppingAssistantBridgeData = {
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
}

function getAuditLogEvent({
    id,
    type,
    created_datetime,
    context = null,
    user_id = null,
    data = {},
}: AuditLogEventParams) {
    return mockEvent({
        id,
        object_type: 'ticket',
        type,
        created_datetime,
        context,
        user_id,
        data,
    } as any)
}

function getEventsHandler(events: unknown[]) {
    return mockListEventsHandler(async () =>
        HttpResponse.json(
            mockListEventsResponse({
                data: events as any[],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                },
            }),
        ),
    )
}

function getAuditLogItemByType(
    items: ReturnType<typeof useTicketThreadEvents>['events'],
    type: string,
): TicketThreadAuditLogEventItem | undefined {
    return items.find(
        (item): item is TicketThreadAuditLogEventItem =>
            item._tag === TicketThreadItemTag.Events.AuditLogEvent &&
            item.data.type === type,
    )
}

describe('useTicketThreadEvents', () => {
    it('applies strict action-executed filtering and merges shopping assistant events', async () => {
        const mockListEvents = getEventsHandler([
            mockEvent({
                object_type: 'ticket',
                created_datetime: '2024-03-21T11:00:00Z',
                type: 'satisfaction-survey-responded',
                data: {},
            } as any),
            mockEvent({
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
            } as any),
            mockEvent({
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
            } as any),
            mockEvent({
                object_type: 'ticket',
                created_datetime: '2024-03-21T11:03:00Z',
                type: 'ticket-updated',
                data: {},
            } as any),
            mockEvent({
                object_type: 'ticket',
                created_datetime: '2024-03-21T11:04:00Z',
                type: 'ticket-updated',
                data: {
                    action_name: 'setStatus',
                },
            } as any),
            mockEvent({
                object_type: 'ticket',
                created_datetime: '2024-03-21T11:05:00Z',
                type: 'action-executed',
                data: {
                    action_id:
                        'shopifyUpdateCustomerTags-360037000-33858-e4fd6c5d6f814f192458ff177d5d62b8101f1c90',
                    action_label: null,
                    action_name: 'shopifyUpdateCustomerTags',
                    app_id: null,
                    integration_id: 33858,
                    payload: {
                        tags_list: 'vip,refund',
                    },
                    status: 'success',
                },
            } as any),
        ])
        const waitForListEventsRequest = mockListEvents.waitForRequest(server)

        server.use(mockListEvents.handler)

        const { result } = renderHook(
            () => useTicketThreadEvents({ ticketId: 7 }),
            {
                ...shoppingAssistantBridgeData,
            },
        )

        await waitForListEventsRequest((request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('object_id')).toBe('7')
        })
        await waitFor(() => {
            expect(result.current.events).toHaveLength(4)
        })

        expect(result.current.events.map((event) => event._tag)).toEqual([
            TicketThreadItemTag.Events.SatisfactionSurveyRespondedEvent,
            TicketThreadItemTag.Events.PrivateReplyEvent,
            TicketThreadItemTag.Events.ActionExecutedEvent,
            TicketThreadItemTag.Events.ShoppingAssistantEvent,
        ])
        expect(result.current.hasSatisfactionSurveyRespondedEvent).toBe(true)
    })

    it('sets via-rule attribution when an older rule-executed event with same context exists', async () => {
        const mockListEvents = getEventsHandler([
            getAuditLogEvent({
                id: 1,
                type: 'rule-executed',
                context: 'ctx-1',
                created_datetime: '2024-03-21T11:00:00Z',
                data: { id: 100, name: 'Main rule' },
            }),
            getAuditLogEvent({
                id: 2,
                type: 'ticket-assigned',
                context: 'ctx-1',
                user_id: 12,
                created_datetime: '2024-03-21T11:01:00Z',
                data: { assignee_user_id: 12 },
            }),
        ])

        server.use(mockListEvents.handler)

        const { result } = renderHook(() =>
            useTicketThreadEvents({ ticketId: 7 }),
        )

        await waitFor(() => {
            expect(result.current.events).toHaveLength(2)
        })

        const auditLogItem = getAuditLogItemByType(
            result.current.events,
            'ticket-assigned',
        )

        expect(auditLogItem?.meta.attribution).toBe('via-rule')
    })

    it('sets none attribution for rule-executed and rule-suggestion-suggested events', async () => {
        const mockListEvents = getEventsHandler([
            getAuditLogEvent({
                id: 1,
                type: 'rule-executed',
                context: 'ctx-1',
                created_datetime: '2024-03-21T11:00:00Z',
                user_id: 12,
                data: { id: 100, name: 'Main rule' },
            }),
            getAuditLogEvent({
                id: 2,
                type: 'rule-suggestion-suggested',
                context: 'ctx-2',
                created_datetime: '2024-03-21T11:01:00Z',
                user_id: 12,
                data: { slug: 'suggested-rule' },
            }),
        ])

        server.use(mockListEvents.handler)

        const { result } = renderHook(() =>
            useTicketThreadEvents({ ticketId: 7 }),
        )

        await waitFor(() => {
            expect(result.current.events).toHaveLength(2)
        })

        const ruleExecuted = getAuditLogItemByType(
            result.current.events,
            'rule-executed',
        )
        const suggestion = getAuditLogItemByType(
            result.current.events,
            'rule-suggestion-suggested',
        )

        expect(ruleExecuted?.meta.attribution).toBe('none')
        expect(suggestion?.meta.attribution).toBe('none')
    })

    it('falls back to author or none when no via-rule context match exists', async () => {
        const mockListEvents = getEventsHandler([
            getAuditLogEvent({
                id: 1,
                type: 'rule-executed',
                context: 'ctx-1',
                created_datetime: '2024-03-21T11:00:00Z',
                data: { id: 100, name: 'Main rule' },
            }),
            getAuditLogEvent({
                id: 2,
                type: 'ticket-closed',
                context: 'ctx-mismatch',
                user_id: 8,
                created_datetime: '2024-03-21T11:01:00Z',
            }),
            getAuditLogEvent({
                id: 3,
                type: 'ticket-closed',
                context: 'ctx-none',
                created_datetime: '2024-03-21T11:02:00Z',
            }),
        ])

        server.use(mockListEvents.handler)

        const { result } = renderHook(() =>
            useTicketThreadEvents({ ticketId: 7 }),
        )

        await waitFor(() => {
            expect(result.current.events).toHaveLength(3)
        })

        const closedEvents = result.current.events.filter(
            (item): item is TicketThreadAuditLogEventItem =>
                item._tag === TicketThreadItemTag.Events.AuditLogEvent &&
                item.data.type === 'ticket-closed',
        )

        expect(closedEvents[0]?.meta.attribution).toBe('author')
        expect(closedEvents[1]?.meta.attribution).toBe('none')
    })

    it('returns empty events and false survey flag when no event source exists', async () => {
        const mockListEvents = getEventsHandler([])

        server.use(mockListEvents.handler)

        const { result } = renderHook(
            () => useTicketThreadEvents({ ticketId: 999 }),
            {
                currentTicketShoppingAssistantData: {
                    influencedOrders: [],
                    shopifyOrders: [],
                    shopifyIntegrations: [],
                },
                currentTicketRuleSuggestionData: {
                    shouldDisplayDemoSuggestion: true,
                },
            },
        )

        await waitFor(() => {
            expect(result.current.events).toEqual([])
        })
        expect(result.current.hasSatisfactionSurveyRespondedEvent).toBe(false)
    })
})
