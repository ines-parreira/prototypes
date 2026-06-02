import { render } from '@repo/testing'
import type { TicketThreadAiAgentDraftMessageParams } from '@repo/ticket-thread/legacy-bridge'
import { screen } from '@testing-library/react'

import { AiAgentDraftMessageHelpdeskV2 } from 'pages/tickets/detail/components/TicketMessages/AIAgentDraftMessageHelpdeskV2/AiAgentDraftMessageHelpdeskV2'

import { TicketThreadAiAgentDraftMessage } from '../TicketThreadAiAgentDraftMessage'

jest.mock(
    'pages/tickets/detail/components/TicketMessages/AIAgentDraftMessageHelpdeskV2/AiAgentDraftMessageHelpdeskV2',
    () => ({
        AiAgentDraftMessageHelpdeskV2: jest.fn(() => (
            <div>AiAgentDraftMessageHelpdeskV2</div>
        )),
    }),
)

const mockAiAgentDraftMessageHelpdeskV2 =
    AiAgentDraftMessageHelpdeskV2 as jest.Mock

const message = {
    id: 123,
    ticket_id: 1,
    created_datetime: '2025-06-01T00:00:00Z',
    sender: {
        id: 1,
        email: 'bot@658d6f54fbff9b7c6f2d0321',
        name: 'AI Agent',
    },
} as unknown as TicketThreadAiAgentDraftMessageParams['message']

function renderComponent(
    props: TicketThreadAiAgentDraftMessageParams = {
        message,
    },
) {
    return render(<TicketThreadAiAgentDraftMessage {...props} />)
}

describe('TicketThreadAiAgentDraftMessage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the Helpdesk V2 draft message component for draft messages', () => {
        renderComponent()

        expect(
            screen.getByText('AiAgentDraftMessageHelpdeskV2'),
        ).toBeInTheDocument()
        expect(mockAiAgentDraftMessageHelpdeskV2).toHaveBeenCalledWith(
            {
                ticketId: 1,
                message,
            },
            expect.anything(),
        )
    })

    it('returns null when the ticket id is missing', () => {
        const { container } = renderComponent({
            message: {
                ...message,
                ticket_id: undefined,
            } as unknown as TicketThreadAiAgentDraftMessageParams['message'],
        })

        expect(container.firstChild).toBeNull()
        expect(mockAiAgentDraftMessageHelpdeskV2).not.toHaveBeenCalled()
    })
})
