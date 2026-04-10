import { logEventWithSampling, SegmentEvent } from '@repo/logging'
import type { TicketThreadAiAgentTrialMessageParams } from '@repo/ticket-thread/legacy-bridge'
import { render, screen } from '@testing-library/react'
import { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { BANNER_TYPE } from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import { AiAgentTrialMessageHelpdeskV2 } from 'pages/tickets/detail/components/TicketMessages/AIAgentTrialMessageHelpdeskV2/AiAgentTrialMessageHelpdeskV2'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getActiveView } from 'state/views/selectors'

import { TicketThreadAiAgentTrialMessage } from '../TicketThreadAiAgentTrialMessage'

jest.mock('hooks/useAppSelector')
jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEventWithSampling: jest.fn(),
}))
jest.mock(
    'pages/tickets/detail/components/TicketMessages/AIAgentTrialMessageHelpdeskV2/AiAgentTrialMessageHelpdeskV2',
    () => ({
        AiAgentTrialMessageHelpdeskV2: jest.fn(() => (
            <div>AiAgentTrialMessageHelpdeskV2</div>
        )),
    }),
)

const mockUseAppSelector = useAppSelector as jest.Mock
const logEventWithSamplingMock = logEventWithSampling as jest.Mock
const mockAiAgentTrialMessageHelpdeskV2 =
    AiAgentTrialMessageHelpdeskV2 as jest.Mock

const currentAccount = Map({ id: 123 })
const activeView = Map({ slug: 'tickets' })
const currentUser = Map({
    role: Map({ name: 'agent' }),
})

const message = {
    id: 123,
    ticket_id: 1,
    created_datetime: '2025-06-01T00:00:00Z',
    sender: {
        id: 1,
        email: 'bot@658d6f54fbff9b7c6f2d0321',
        name: 'AI Agent',
    },
} as unknown as TicketThreadAiAgentTrialMessageParams['message']

function renderComponent(
    props: TicketThreadAiAgentTrialMessageParams = {
        message,
    },
) {
    return render(<TicketThreadAiAgentTrialMessage {...props} />)
}

describe('TicketThreadAiAgentTrialMessage', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAppSelector.mockImplementation((selector: unknown) => {
            if (selector === getCurrentAccountState) {
                return currentAccount
            }

            if (selector === getActiveView) {
                return activeView
            }

            return currentUser
        })
    })

    it('renders the Helpdesk V2 trial message component for trial messages', () => {
        renderComponent()

        expect(
            screen.getByText('AiAgentTrialMessageHelpdeskV2'),
        ).toBeInTheDocument()
        expect(mockAiAgentTrialMessageHelpdeskV2).toHaveBeenCalledWith(
            {
                ticketId: 1,
                message,
            },
            expect.anything(),
        )
        expect(logEventWithSamplingMock).toHaveBeenCalledWith(
            SegmentEvent.AiAgentTicketViewed,
            {
                accountId: 123,
                banner: BANNER_TYPE.TRIAL,
                viewedFrom: 'tickets',
                userType: 'agent',
            },
            1,
        )
    })

    it('returns null when the ticket id is missing', () => {
        const { container } = renderComponent({
            message: {
                ...message,
                ticket_id: undefined,
            } as unknown as TicketThreadAiAgentTrialMessageParams['message'],
        })

        expect(container.firstChild).toBeNull()
        expect(mockAiAgentTrialMessageHelpdeskV2).not.toHaveBeenCalled()
    })

    it('tracks the trial impression only once across rerenders', () => {
        const { rerender } = renderComponent()

        rerender(<TicketThreadAiAgentTrialMessage message={message} />)

        expect(logEventWithSamplingMock).toHaveBeenCalledTimes(1)
    })
})
