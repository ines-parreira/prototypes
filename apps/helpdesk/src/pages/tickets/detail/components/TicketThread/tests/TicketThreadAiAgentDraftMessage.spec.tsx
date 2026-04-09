import { logEventWithSampling, SegmentEvent } from '@repo/logging'
import type { TicketThreadAiAgentDraftMessageParams } from '@repo/ticket-thread/legacy-bridge'
import { render, screen } from '@testing-library/react'
import { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { BANNER_TYPE } from 'pages/tickets/detail/components/AIAgentFeedbackBar/constants'
import { AiAgentDraftMessageHelpdeskV2 } from 'pages/tickets/detail/components/TicketMessages/AIAgentDraftMessageHelpdeskV2/AiAgentDraftMessageHelpdeskV2'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getActiveView } from 'state/views/selectors'

import { TicketThreadAiAgentDraftMessage } from '../TicketThreadAiAgentDraftMessage'

jest.mock('hooks/useAppSelector')
jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEventWithSampling: jest.fn(),
}))
jest.mock(
    'pages/tickets/detail/components/TicketMessages/AIAgentDraftMessageHelpdeskV2/AiAgentDraftMessageHelpdeskV2',
    () => ({
        AiAgentDraftMessageHelpdeskV2: jest.fn(() => (
            <div>AiAgentDraftMessageHelpdeskV2</div>
        )),
    }),
)

const mockUseAppSelector = useAppSelector as jest.Mock
const logEventWithSamplingMock = logEventWithSampling as jest.Mock
const mockAiAgentDraftMessageHelpdeskV2 =
    AiAgentDraftMessageHelpdeskV2 as jest.Mock

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
} as unknown as TicketThreadAiAgentDraftMessageParams['message']

function renderComponent(
    props: TicketThreadAiAgentDraftMessageParams = {
        message,
        isTrial: false,
    },
) {
    return render(<TicketThreadAiAgentDraftMessage {...props} />)
}

describe('TicketThreadAiAgentDraftMessage', () => {
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

    it('renders the Helpdesk V2 draft message component for draft messages', () => {
        renderComponent()

        expect(
            screen.getByText('AiAgentDraftMessageHelpdeskV2'),
        ).toBeInTheDocument()
        expect(mockAiAgentDraftMessageHelpdeskV2).toHaveBeenCalledWith(
            {
                ticketId: 1,
                message,
                isTrial: false,
            },
            expect.anything(),
        )
        expect(logEventWithSamplingMock).toHaveBeenCalledWith(
            SegmentEvent.AiAgentTicketViewed,
            {
                accountId: 123,
                banner: BANNER_TYPE.QA_FAILED,
                viewedFrom: 'tickets',
                userType: 'agent',
            },
            1,
        )
    })

    it('logs the trial impression for trial messages', () => {
        renderComponent({
            message,
            isTrial: true,
        })

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
            } as unknown as TicketThreadAiAgentDraftMessageParams['message'],
            isTrial: false,
        })

        expect(container.firstChild).toBeNull()
        expect(mockAiAgentDraftMessageHelpdeskV2).not.toHaveBeenCalled()
    })
})
