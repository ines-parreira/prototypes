import type * as TicketsModule from '@repo/tickets'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockCustomer,
    mockGetCustomerHandler,
    mockGetTicketHandler,
    mockListIntegrationsHandler,
    mockListIntegrationsResponse,
    mockListUsersHandler,
    mockListUsersResponse,
    mockListVoiceCallEventsHandler,
    mockListVoiceCallEventsResponse,
    mockListVoiceCallRecordingsHandler,
    mockListVoiceCallRecordingsResponse,
    mockTicket,
    mockTicketMessage,
    mockVoiceCall,
} from '@gorgias/helpdesk-mocks'

import { PHONE_EVENTS } from '../../../hooks/events/constants'
import { InfluencedOrderSource } from '../../../hooks/shopping-assistant-events/constants'
import type { TicketThreadItem } from '../../../hooks/types'
import { TicketThreadItemTag } from '../../../hooks/types'
import { getCurrentUserHandler } from '../../../tests/getCurrentUser.mock'
import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { useTicketThreadLegacyBridge } from '../../../utils/LegacyBridge'
import { TicketThreadItem as TicketThreadItemComponent } from '../TicketThreadItem'

vi.mock('../../MessageBubble/components/TranslationsDropdown', () => ({
    TranslationsDropdown: () => null,
}))
vi.mock('@repo/tickets', async () => {
    const actual = await vi.importActual<typeof TicketsModule>('@repo/tickets')
    return {
        ...actual,
        useCurrentUserLanguagePreferences: vi.fn(() => ({
            shouldShowTranslatedContent: () => false,
        })),
        useTicketMessageTranslations: vi.fn(() => ({
            getMessageTranslation: () => null,
        })),
        useTicketMessageDisplayState: vi.fn(() => ({
            display: actual.DisplayedContent.Original,
        })),
    }
})

vi.mock('../../../utils/LegacyBridge', () => ({
    useTicketThreadLegacyBridge: vi.fn(),
}))

const mockUseTicketThreadLegacyBridge = vi.mocked(useTicketThreadLegacyBridge)

beforeEach(() => {
    window.GORGIAS_STATE = {
        currentAccount: {
            domain: 'acme',
        },
    }

    server.use(
        getCurrentUserHandler().handler,
        mockGetTicketHandler(async ({ params }) =>
            HttpResponse.json(
                mockTicket({
                    id: Number(params?.id ?? 1),
                }),
            ),
        ).handler,
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
        mockGetCustomerHandler(async () =>
            HttpResponse.json(
                mockCustomer({
                    id: 100,
                    name: 'Test Customer',
                }),
            ),
        ).handler,
        mockListVoiceCallEventsHandler(async () =>
            HttpResponse.json(mockListVoiceCallEventsResponse({ data: [] })),
        ).handler,
        mockListVoiceCallRecordingsHandler(async () =>
            HttpResponse.json(
                mockListVoiceCallRecordingsResponse({ data: [] }),
            ),
        ).handler,
    )
    mockUseTicketThreadLegacyBridge.mockReturnValue({
        currentTicketShoppingAssistantData: {
            influencedOrders: [],
            shopifyOrders: [],
            shopifyIntegrations: [],
        },
        currentTicketRuleSuggestionData: { shouldDisplayDemoSuggestion: false },
        onInstagramCommentPrivateReply: vi.fn(),
        onInstagramCommentHideComment: vi.fn(),
        onFacebookCommentPrivateReply: vi.fn(),
        onFacebookCommentHideComment: vi.fn(),
        onFacebookCommentLike: vi.fn(),
        legacyActions: {
            deleteTicketPendingMessage: vi.fn(),
            retrySubmitTicketMessage: vi.fn(),
        },
        legacyState: {
            newMessage: {
                isSubmittingMessage: false,
            },
        },
    })
})

const messageData = mockTicketMessage({
    body_html: null,
    stripped_html: null,
    body_text: 'hello',
    stripped_text: 'hello',
})
const eventData = {
    object_type: 'Ticket',
    type: 'ticket-updated',
    data: { action_name: 'setStatus' },
}
const phoneEventData = {
    object_type: 'Ticket',
    type: PHONE_EVENTS[0],
} as const
const voiceCallData = mockVoiceCall({
    id: 1,
    status: 'completed',
    direction: 'inbound',
    customer_id: 100,
    phone_number_source: '+1234567890',
    phone_number_destination: '+0987654321',
    created_datetime: '2024-03-21T11:00:00Z',
    started_datetime: '2024-03-21T11:00:00Z',
    duration: 120,
    last_answered_by_agent_id: 1,
})
const influencedOrderData = {
    orderId: 123456789,
    orderNumber: 1001,
    shopName: 'test-shop',
    created_datetime: '2024-03-20T10:00:00Z',
    influencedBy: InfluencedOrderSource.SHOPPING_ASSISTANT,
}
const satisfactionSurveyData = {
    authorLabel: 'Jane Customer',
    body_text: 'Great support',
    score: 4,
}
const ruleSuggestionData = { rule_suggestion: { id: 1 } }
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
}

function renderItem(
    item: TicketThreadItem,
    options?: Parameters<typeof render>[1],
) {
    return render(<TicketThreadItemComponent item={item} />, options)
}

function hasExactText(text: string) {
    return (_content: string, node: Element | null) =>
        node?.textContent === text
}

describe('TicketThreadItem', () => {
    it('renders a message item', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages.Message,
            data: messageData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadItem)

        expect(screen.getByText(messageData.body_text!)).toBeInTheDocument()
    })

    it('renders an internal note item', () => {
        renderItem({
            _tag: TicketThreadItemTag.Messages.InternalNote,
            data: messageData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadItem)

        expect(screen.getByText(messageData.body_text!)).toBeInTheDocument()
    })

    it('renders a ticket event item', () => {
        renderItem(
            {
                _tag: TicketThreadItemTag.Events.TicketEvent,
                data: eventData,
                datetime: '2024-03-21T11:00:00Z',
            } as TicketThreadItem,
            {
                initialEntries: ['/?show_ticket_events=true'],
            },
        )

        expect(screen.getByText(JSON.stringify(eventData))).toBeInTheDocument()
    })

    it('does not render a ticket event item when ticket events are hidden', () => {
        renderItem({
            _tag: TicketThreadItemTag.Events.TicketEvent,
            data: eventData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadItem)

        expect(
            screen.queryByText(JSON.stringify(eventData)),
        ).not.toBeInTheDocument()
    })

    it('renders an action executed event item', () => {
        renderItem(
            {
                _tag: TicketThreadItemTag.Events.ActionExecutedEvent,
                data: actionExecutedEventData,
                datetime: '2024-03-21T11:00:00Z',
            } as TicketThreadItem,
            {
                initialEntries: ['/?show_ticket_events=true'],
            },
        )

        expect(screen.getByText('Refund order')).toBeInTheDocument()
    })

    it('renders a merged events item', () => {
        renderItem(
            {
                _tag: TicketThreadItemTag.Events.GroupedEvents,
                datetime: '2024-03-21T11:00:00Z',
                data: [
                    {
                        _tag: TicketThreadItemTag.Events.TicketEvent,
                        data: eventData,
                        datetime: '2024-03-21T11:00:00Z',
                    },
                    {
                        _tag: TicketThreadItemTag.Events.PhoneEvent,
                        data: phoneEventData,
                        datetime: '2024-03-21T11:00:01Z',
                    },
                ],
            } as TicketThreadItem,
            {
                initialEntries: ['/?show_ticket_events=true'],
            },
        )

        expect(screen.getByText(JSON.stringify(eventData))).toBeInTheDocument()
        expect(
            screen.getByText('Phone conversation started'),
        ).toBeInTheDocument()
    })

    it('does not render a merged events item when ticket events are hidden', () => {
        renderItem({
            _tag: TicketThreadItemTag.Events.GroupedEvents,
            datetime: '2024-03-21T11:00:00Z',
            data: [
                {
                    _tag: TicketThreadItemTag.Events.TicketEvent,
                    data: eventData,
                    datetime: '2024-03-21T11:00:00Z',
                },
                {
                    _tag: TicketThreadItemTag.Events.PhoneEvent,
                    data: phoneEventData,
                    datetime: '2024-03-21T11:00:01Z',
                },
            ],
        } as TicketThreadItem)

        expect(
            screen.queryByText(JSON.stringify(eventData)),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Phone conversation started'),
        ).not.toBeInTheDocument()
    })

    it('renders a voice call item', async () => {
        renderItem({
            _tag: TicketThreadItemTag.VoiceCalls.VoiceCall,
            data: voiceCallData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadItem)

        await waitFor(() => {
            expect(screen.getByText('called')).toBeInTheDocument()
        })
    })

    it('renders an outbound voice call item', async () => {
        const outboundData = mockVoiceCall({
            id: 2,
            status: 'completed',
            direction: 'outbound',
            customer_id: 100,
            initiated_by_agent_id: 1,
            phone_number_source: '+0987654321',
            phone_number_destination: '+1234567890',
            created_datetime: '2024-03-21T11:00:00Z',
            started_datetime: '2024-03-21T11:00:00Z',
            duration: 60,
        })
        renderItem({
            _tag: TicketThreadItemTag.VoiceCalls.OutboundVoiceCall,
            data: outboundData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadItem)

        await waitFor(() => {
            expect(screen.getByText('made a call')).toBeInTheDocument()
        })
    })

    it('renders a satisfaction survey item', () => {
        renderItem({
            _tag: TicketThreadItemTag.SatisfactionSurvey,
            status: 'responded',
            data: satisfactionSurveyData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadItem)

        expect(screen.getByText('4 stars CSAT review')).toBeInTheDocument()
    })

    it('renders an influenced order item', () => {
        renderItem({
            _tag: TicketThreadItemTag.ShoppingAssistant.InfluencedOrder,
            data: influencedOrderData,
            datetime: '2024-03-20T10:00:00Z',
        } as TicketThreadItem)

        expect(
            screen.getByRole('link', { name: /order #1001/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('influenced')).toBeInTheDocument()
        expect(
            screen.getByText(hasExactText('via Shopping Assistant')),
        ).toBeInTheDocument()
    })

    it('renders a rule suggestion item', () => {
        renderItem({
            _tag: TicketThreadItemTag.RuleSuggestion,
            data: ruleSuggestionData,
        } as TicketThreadItem)

        expect(
            screen.getByText(JSON.stringify(ruleSuggestionData)),
        ).toBeInTheDocument()
    })

    it('renders a contact reason suggestion item', () => {
        renderItem({
            _tag: TicketThreadItemTag.ContactReasonSuggestion,
            data: null,
        } as TicketThreadItem)

        expect(screen.getByText('null')).toBeInTheDocument()
    })
})
