import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListIntegrationsHandler,
    mockListIntegrationsResponse,
    mockListUsersHandler,
    mockListUsersResponse,
} from '@gorgias/helpdesk-mocks'

import {
    InfluencedOrderSource,
    PHONE_EVENTS,
    PRIVATE_REPLY_ACTIONS,
} from '../../../hooks/events/constants'
import type {
    TicketThreadGroupedEventsItem as TicketThreadGroupedEventsItemType,
    TicketThreadSingleEventItem as TicketThreadSingleEventItemType,
} from '../../../hooks/events/types'
import { SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE } from '../../../hooks/satisfaction-survey/constants'
import { TicketThreadItemTag } from '../../../hooks/types'
import { getCurrentUserHandler } from '../../../tests/getCurrentUser.mock'
import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { TicketThreadSingleEventItem } from '../TicketTheadEventItem'
import { TicketThreadGroupedEventsItem } from '../TicketTheadGroupedEventsItem'

const ticketEventData = {
    object_type: 'Ticket',
    type: 'ticket-updated',
} as const
const phoneEventData = { object_type: 'Ticket', type: PHONE_EVENTS[0] } as const
const satisfactionSurveyRespondedEventData = {
    object_type: 'Ticket',
    type: SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE,
    created_datetime: '2024-03-21T11:00:00Z',
    data: {
        score: 5,
        body_text: 'Great support',
    },
} as const
const privateReplyEventData = {
    object_type: 'Ticket',
    type: 'ticket-updated',
    data: {
        action_name: PRIVATE_REPLY_ACTIONS[0],
    },
} as const
const shoppingAssistantEventData = {
    orderId: 100,
    orderNumber: 200,
    shopName: 'Acme Shop',
    created_datetime: '2024-03-21T11:00:00Z',
    influencedBy: InfluencedOrderSource.SHOPPING_ASSISTANT,
} as const
const auditLogEventData = {
    object_type: 'Ticket',
    type: 'ticket-created',
    data: {},
    created_datetime: '2024-03-21T11:00:00Z',
} as const
const actionExecutedEventData = {
    object_type: 'Ticket',
    type: 'action-executed',
    created_datetime: '2024-03-21T11:00:00Z',
    data: {
        action_id: 'shopifyRefundOrder-1-33858-abc',
        action_label: null,
        action_name: 'shopifyRefundOrder',
        app_id: null,
        integration_id: null,
        payload: {
            order_id: 360037000,
        },
        status: 'success',
    },
} as const

function renderItem(item: TicketThreadSingleEventItemType) {
    return render(<TicketThreadSingleEventItem item={item} />)
}

function renderGroupedItem(item: TicketThreadGroupedEventsItemType) {
    return render(<TicketThreadGroupedEventsItem item={item} />)
}

describe('TicketThreadEventItem', () => {
    beforeEach(() => {
        server.use(
            getCurrentUserHandler().handler,
            mockListIntegrationsHandler(async () =>
                HttpResponse.json(
                    mockListIntegrationsResponse({
                        data: [],
                        meta: {
                            prev_cursor: null,
                            next_cursor: null,
                        },
                    }),
                ),
            ).handler,
            mockListUsersHandler(async () =>
                HttpResponse.json(
                    mockListUsersResponse({
                        data: [],
                        meta: {
                            prev_cursor: null,
                            next_cursor: null,
                        },
                    }),
                ),
            ).handler,
        )
    })

    const eventItems: Array<{
        label: string
        item: TicketThreadSingleEventItemType
        renderedText: string
    }> = [
        {
            label: 'ticket event',
            item: {
                _tag: TicketThreadItemTag.Events.TicketEvent,
                data: ticketEventData,
                datetime: '2024-03-21T11:00:00Z',
            },
            renderedText: JSON.stringify(ticketEventData),
        },
        {
            label: 'phone event',
            item: {
                _tag: TicketThreadItemTag.Events.PhoneEvent,
                data: phoneEventData,
                datetime: '2024-03-21T11:00:00Z',
            },
            renderedText: 'Phone conversation started',
        },
        {
            label: 'audit log event',
            item: {
                _tag: TicketThreadItemTag.Events.AuditLogEvent,
                type: 'ticket-created',
                data: auditLogEventData,
                datetime: '2024-03-21T11:00:00Z',
                meta: { attribution: 'none' },
            },
            renderedText: 'Ticket was created',
        },
        {
            label: 'satisfaction survey responded event',
            item: {
                _tag: TicketThreadItemTag.Events
                    .SatisfactionSurveyRespondedEvent,
                data: satisfactionSurveyRespondedEventData,
                datetime: '2024-03-21T11:00:00Z',
            },
            renderedText: JSON.stringify(satisfactionSurveyRespondedEventData),
        },
        {
            label: 'private reply event',
            item: {
                _tag: TicketThreadItemTag.Events.PrivateReplyEvent,
                data: privateReplyEventData,
                datetime: '2024-03-21T11:00:00Z',
            },
            renderedText: JSON.stringify(privateReplyEventData),
        },
        {
            label: 'shopping assistant event',
            item: {
                _tag: TicketThreadItemTag.Events.ShoppingAssistantEvent,
                data: shoppingAssistantEventData,
                datetime: '2024-03-21T11:00:00Z',
            },
            renderedText: JSON.stringify(shoppingAssistantEventData),
        },
        {
            label: 'action executed event',
            item: {
                _tag: TicketThreadItemTag.Events.ActionExecutedEvent,
                data: actionExecutedEventData,
                datetime: '2024-03-21T11:00:00Z',
            },
            renderedText: 'Refund order',
        },
    ]

    it.each(eventItems)('renders $label item', ({ item, renderedText }) => {
        renderItem(item)

        expect(screen.getByText(renderedText)).toBeInTheDocument()
    })

    it('renders grouped events', () => {
        const firstEventData = {
            object_type: 'Ticket',
            type: 'ticket-updated',
        } as const
        const secondEventData = {
            object_type: 'Ticket',
            type: PHONE_EVENTS[1],
        } as const
        const groupedItem: TicketThreadGroupedEventsItemType = {
            _tag: TicketThreadItemTag.Events.GroupedEvents,
            datetime: '2024-03-21T11:00:00Z',
            data: [
                {
                    _tag: TicketThreadItemTag.Events.TicketEvent,
                    data: firstEventData,
                    datetime: '2024-03-21T11:00:00Z',
                },
                {
                    _tag: TicketThreadItemTag.Events.PhoneEvent,
                    data: secondEventData,
                    datetime: '2024-03-21T11:00:01Z',
                },
            ],
        }

        const { container } = renderGroupedItem(groupedItem)

        expect(
            screen.getByText(JSON.stringify(firstEventData)),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Call forwarded to an external number'),
        ).toBeInTheDocument()
        expect(container.firstChild).toHaveStyle({ gap: '4px' })
    })
})
