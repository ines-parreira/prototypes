import { isSessionImpersonated } from '@repo/activity-tracker/utils'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { render } from '@repo/testing'
import type { TicketThreadAiAgentReasoningParams } from '@repo/ticket-thread/legacy-bridge'
import { screen } from '@testing-library/react'

import { TicketVia } from 'business/types/ticket'
import { useTicketIsAfterFeedbackCollectionPeriod } from 'common/utils/useIsTicketAfterFeedbackCollectionPeriod'
import { useGetEarliestExecution } from 'models/knowledgeService/queries'
import { AiAgentReasoningHelpdeskV2 } from 'pages/tickets/detail/components/TicketMessages/AiAgentReasoningHelpdeskV2'
import { SimplifiedAIAgentBanner } from 'pages/tickets/detail/components/TicketMessages/SimplifiedAIAgentBanner'

import { TicketThreadAiAgentReasoning } from '../TicketThreadAiAgentReasoning'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('common/utils/useIsTicketAfterFeedbackCollectionPeriod', () => ({
    useTicketIsAfterFeedbackCollectionPeriod: jest.fn(),
}))

jest.mock('models/knowledgeService/queries', () => ({
    useGetEarliestExecution: jest.fn(),
}))

jest.mock(
    'pages/tickets/detail/components/TicketMessages/AiAgentReasoningHelpdeskV2',
    () => ({
        AiAgentReasoningHelpdeskV2: jest.fn(() => <div>AiAgentReasoning</div>),
    }),
)

jest.mock(
    'pages/tickets/detail/components/TicketMessages/SimplifiedAIAgentBanner',
    () => ({
        SimplifiedAIAgentBanner: jest.fn(() => (
            <div>SimplifiedAIAgentBanner</div>
        )),
    }),
)

jest.mock('@repo/activity-tracker/utils', () => ({
    isSessionImpersonated: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock
const mockUseTicketIsAfterFeedbackCollectionPeriod =
    useTicketIsAfterFeedbackCollectionPeriod as jest.Mock
const mockUseGetEarliestExecution = useGetEarliestExecution as jest.Mock
const mockIsSessionImpersonated = isSessionImpersonated as jest.Mock
const mockAiAgentReasoning = AiAgentReasoningHelpdeskV2 as jest.Mock
const mockSimplifiedAIAgentBanner = SimplifiedAIAgentBanner as jest.Mock

const flagValues: Partial<Record<FeatureFlagKey, boolean>> = {
    [FeatureFlagKey.ShowAiReasoningInTicket]: true,
    [FeatureFlagKey.OnlyShowReasoningWhileImpersonating]: false,
}

const message = {
    id: 123,
    ticket_id: 1,
    created_datetime: '2025-06-01T00:00:00Z',
    via: TicketVia.Api,
    public: true,
    sender: {
        id: 1,
        email: 'bot@658d6f54fbff9b7c6f2d0321',
        name: 'AI Agent',
    },
    meta: null,
} as unknown as TicketThreadAiAgentReasoningParams['message']

function renderComponent(
    props: TicketThreadAiAgentReasoningParams = { message },
) {
    return render(<TicketThreadAiAgentReasoning {...props} />)
}

describe('TicketThreadAiAgentReasoning', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        flagValues[FeatureFlagKey.ShowAiReasoningInTicket] = true
        flagValues[FeatureFlagKey.OnlyShowReasoningWhileImpersonating] = false
        mockUseFlag.mockImplementation(
            (flag: FeatureFlagKey) => flagValues[flag] ?? false,
        )
        mockUseTicketIsAfterFeedbackCollectionPeriod.mockReturnValue(true)
        mockUseGetEarliestExecution.mockReturnValue({
            data: {
                reasoningTimestamp: '2025-01-01T00:00:00Z',
            },
        })
        mockIsSessionImpersonated.mockReturnValue(false)
    })

    it('renders reasoning when all legacy conditions pass', () => {
        renderComponent()

        expect(screen.getByText('AiAgentReasoning')).toBeInTheDocument()
        expect(mockAiAgentReasoning).toHaveBeenCalledWith(
            { message },
            expect.anything(),
        )
    })

    it('renders the simplified banner when reasoning is disabled by flag', () => {
        flagValues[FeatureFlagKey.ShowAiReasoningInTicket] = false

        renderComponent()

        expect(screen.getByText('SimplifiedAIAgentBanner')).toBeInTheDocument()
        expect(mockSimplifiedAIAgentBanner).toHaveBeenCalledWith(
            { message, messages: [message] },
            expect.anything(),
        )
    })

    it('renders the simplified banner before the feedback collection period', () => {
        mockUseTicketIsAfterFeedbackCollectionPeriod.mockReturnValue(false)

        renderComponent()

        expect(screen.getByText('SimplifiedAIAgentBanner')).toBeInTheDocument()
        expect(screen.queryByText('AiAgentReasoning')).not.toBeInTheDocument()
    })

    it('renders the simplified banner when the message via is not API', () => {
        renderComponent({
            message: {
                ...message,
                via: TicketVia.GorgiasChat,
            },
        })

        expect(screen.getByText('SimplifiedAIAgentBanner')).toBeInTheDocument()
        expect(screen.queryByText('AiAgentReasoning')).not.toBeInTheDocument()
    })

    it('renders the simplified banner when the message id is falsy', () => {
        renderComponent({
            message: {
                ...message,
                id: 0,
            },
        })

        expect(screen.getByText('SimplifiedAIAgentBanner')).toBeInTheDocument()
        expect(screen.queryByText('AiAgentReasoning')).not.toBeInTheDocument()
    })

    it('renders nothing while earliest execution is unresolved', () => {
        mockUseGetEarliestExecution.mockReturnValue({
            data: undefined,
        })

        const { container } = renderComponent()

        expect(container).toBeEmptyDOMElement()
    })

    it('renders the simplified banner when reasoning timestamp is missing', () => {
        mockUseGetEarliestExecution.mockReturnValue({
            data: {
                reasoningTimestamp: undefined,
            },
        })

        renderComponent()

        expect(screen.getByText('SimplifiedAIAgentBanner')).toBeInTheDocument()
    })

    it('requires impersonation when the flag is enabled', () => {
        flagValues[FeatureFlagKey.ShowAiReasoningInTicket] = true
        flagValues[FeatureFlagKey.OnlyShowReasoningWhileImpersonating] = true

        const { unmount } = renderComponent()

        expect(screen.getByText('SimplifiedAIAgentBanner')).toBeInTheDocument()
        expect(screen.queryByText('AiAgentReasoning')).not.toBeInTheDocument()

        unmount()
        mockIsSessionImpersonated.mockReturnValue(true)
        renderComponent()

        expect(screen.getByText('AiAgentReasoning')).toBeInTheDocument()
    })
})
