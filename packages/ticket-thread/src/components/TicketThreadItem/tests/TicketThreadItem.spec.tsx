import { screen } from '@testing-library/react'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'

import type { TicketThreadItem } from '../../../hooks/types'
import { TicketThreadItemTag } from '../../../hooks/types'
import { render } from '../../../tests/render.utils'
import { useTicketThreadLegacyBridge } from '../../../utils/LegacyBridge'
import { TicketThreadItem as TicketThreadItemComponent } from '../TicketThreadItem'

vi.mock('../../../utils/LegacyBridge', () => ({
    useTicketThreadLegacyBridge: vi.fn(),
}))

const mockUseTicketThreadLegacyBridge = vi.mocked(useTicketThreadLegacyBridge)

beforeEach(() => {
    mockUseTicketThreadLegacyBridge.mockReturnValue({
        datetimeFormat: 'YYYY-MM-DD',
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
const voiceCallData = { id: 1, status: 'completed' }
const satisfactionSurveyData = { score: 5 }
const ruleSuggestionData = { rule_suggestion: { id: 1 } }

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
                    data: { ...eventData, type: 'phone' },
                    datetime: '2024-03-21T11:00:01Z',
                },
            ],
        } as TicketThreadItem)

        expect(screen.getByText(JSON.stringify(eventData))).toBeInTheDocument()
        expect(
            screen.getByText(JSON.stringify({ ...eventData, type: 'phone' })),
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
            data: satisfactionSurveyData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadItem)

        expect(
            screen.getByText(JSON.stringify(satisfactionSurveyData)),
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
