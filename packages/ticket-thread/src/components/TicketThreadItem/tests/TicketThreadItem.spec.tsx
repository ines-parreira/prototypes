import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListIntegrationsHandler,
    mockListIntegrationsResponse,
    mockListUsersHandler,
    mockListUsersResponse,
    mockTicketMessage,
} from '@gorgias/helpdesk-mocks'

import { PHONE_EVENTS } from '../../../hooks/events/constants'
import type { TicketThreadItem } from '../../../hooks/types'
import { TicketThreadItemTag } from '../../../hooks/types'
import { getCurrentUserHandler } from '../../../tests/getCurrentUser.mock'
import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { useTicketThreadLegacyBridge } from '../../../utils/LegacyBridge'
import { TicketThreadItem as TicketThreadItemComponent } from '../TicketThreadItem'

vi.mock('../../../utils/LegacyBridge', () => ({
    useTicketThreadLegacyBridge: vi.fn(),
}))

const mockUseTicketThreadLegacyBridge = vi.mocked(useTicketThreadLegacyBridge)

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
    mockUseTicketThreadLegacyBridge.mockReturnValue({
        currentTicketShoppingAssistantData: {
            influencedOrders: [],
            shopifyOrders: [],
            shopifyIntegrations: [],
        },
        currentTicketRuleSuggestionData: { shouldDisplayDemoSuggestion: false },
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
const voiceCallData = { id: 1, status: 'completed' }
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

function renderItem(item: TicketThreadItem) {
    return render(<TicketThreadItemComponent item={item} />)
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
        renderItem({
            _tag: TicketThreadItemTag.Events.TicketEvent,
            data: eventData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadItem)

        expect(screen.getByText(JSON.stringify(eventData))).toBeInTheDocument()
    })

    it('renders an action executed event item', () => {
        renderItem({
            _tag: TicketThreadItemTag.Events.ActionExecutedEvent,
            data: actionExecutedEventData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadItem)

        expect(screen.getByText('Refund order')).toBeInTheDocument()
    })

    it('renders a merged events item', () => {
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

        expect(screen.getByText(JSON.stringify(eventData))).toBeInTheDocument()
        expect(
            screen.getByText('Phone conversation started'),
        ).toBeInTheDocument()
    })

    it('renders a voice call item', () => {
        renderItem({
            _tag: TicketThreadItemTag.VoiceCalls.VoiceCall,
            data: voiceCallData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadItem)

        expect(
            screen.getByText(JSON.stringify(voiceCallData)),
        ).toBeInTheDocument()
    })

    it('renders an outbound voice call item', () => {
        renderItem({
            _tag: TicketThreadItemTag.VoiceCalls.OutboundVoiceCall,
            data: voiceCallData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadItem)

        expect(
            screen.getByText(JSON.stringify(voiceCallData)),
        ).toBeInTheDocument()
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
