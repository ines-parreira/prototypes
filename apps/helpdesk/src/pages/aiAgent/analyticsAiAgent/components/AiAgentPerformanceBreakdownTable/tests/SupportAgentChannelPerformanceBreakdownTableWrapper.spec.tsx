import { useFlagWithLoading } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'

import { SupportAgentChannelPerformanceBreakdownTableWrapper } from '../SupportAgentChannelPerformanceBreakdownTableWrapper'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiAgentAnalyticsDashboardsTables:
            'linear.project_revamp-ai-agent-analytics-dashboards.tables',
    },
    useFlagWithLoading: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/SupportAgentChannelPerformanceBreakdownTable',
    () => ({
        SupportAgentChannelPerformanceBreakdownTable: () => (
            <div>SupportAgentChannelPerformanceBreakdownTable</div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/SupportAgentsPerformanceByChannelTable',
    () => ({
        SupportAgentsPerformanceByChannelTable: () => (
            <div>SupportAgentsPerformanceByChannelTable</div>
        ),
    }),
)

const mockedUseFlagWithLoading = jest.mocked(useFlagWithLoading)

describe('SupportAgentChannelPerformanceBreakdownTableWrapper', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders SupportAgentChannelPerformanceBreakdownTable when flag is disabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        render(<SupportAgentChannelPerformanceBreakdownTableWrapper />)

        expect(
            screen.getByText('SupportAgentChannelPerformanceBreakdownTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('SupportAgentsPerformanceByChannelTable'),
        ).not.toBeInTheDocument()
    })

    it('renders SupportAgentsPerformanceByChannelTable when flag is enabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        render(<SupportAgentChannelPerformanceBreakdownTableWrapper />)

        expect(
            screen.getByText('SupportAgentsPerformanceByChannelTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('SupportAgentChannelPerformanceBreakdownTable'),
        ).not.toBeInTheDocument()
    })

    it('renders SupportAgentChannelPerformanceBreakdownTable while the flag is still loading', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: true,
        })

        render(<SupportAgentChannelPerformanceBreakdownTableWrapper />)

        expect(
            screen.getByText('SupportAgentChannelPerformanceBreakdownTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('SupportAgentsPerformanceByChannelTable'),
        ).not.toBeInTheDocument()
    })
})
