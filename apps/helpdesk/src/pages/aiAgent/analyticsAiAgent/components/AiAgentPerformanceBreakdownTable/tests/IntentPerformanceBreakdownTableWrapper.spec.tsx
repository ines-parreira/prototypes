import { useFlagWithLoading } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'

import { IntentPerformanceBreakdownTableWrapper } from '../IntentPerformanceBreakdownTableWrapper'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiAgentAnalyticsDashboardsTables:
            'linear.project_revamp-ai-agent-analytics-dashboards.tables',
    },
    useFlagWithLoading: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/IntentPerformanceBreakdownTable',
    () => ({
        IntentPerformanceBreakdownTable: () => (
            <div>IntentPerformanceBreakdownTable</div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/AllAgentsPerformanceByIntentTable',
    () => ({
        AllAgentsPerformanceByIntentTable: () => (
            <div>AllAgentsPerformanceByIntentTable</div>
        ),
    }),
)

const mockedUseFlagWithLoading = jest.mocked(useFlagWithLoading)

describe('IntentPerformanceBreakdownTableWrapper', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders IntentPerformanceBreakdownTable when flag is disabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        render(<IntentPerformanceBreakdownTableWrapper />)

        expect(
            screen.getByText('IntentPerformanceBreakdownTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('AllAgentsPerformanceByIntentTable'),
        ).not.toBeInTheDocument()
    })

    it('renders AllAgentsPerformanceByIntentTable when flag is enabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        render(<IntentPerformanceBreakdownTableWrapper />)

        expect(
            screen.getByText('AllAgentsPerformanceByIntentTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('IntentPerformanceBreakdownTable'),
        ).not.toBeInTheDocument()
    })

    it('renders IntentPerformanceBreakdownTable while the flag is still loading', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: true,
        })

        render(<IntentPerformanceBreakdownTableWrapper />)

        expect(
            screen.getByText('IntentPerformanceBreakdownTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('AllAgentsPerformanceByIntentTable'),
        ).not.toBeInTheDocument()
    })
})
