import { useFlagWithLoading } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'

import { ChannelPerformanceBreakdownTableWrapper } from '../ChannelPerformanceBreakdownTableWrapper'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiAgentAnalyticsDashboardsTables:
            'linear.project_revamp-ai-agent-analytics-dashboards.tables',
    },
    useFlagWithLoading: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/ChannelPerformanceBreakdownTable',
    () => ({
        ChannelPerformanceBreakdownTable: () => (
            <div>ChannelPerformanceBreakdownTable</div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/AllAgentsPerformanceByChannelTable',
    () => ({
        AllAgentsPerformanceByChannelTable: () => (
            <div>AllAgentsPerformanceByChannelTable</div>
        ),
    }),
)

const mockedUseFlagWithLoading = jest.mocked(useFlagWithLoading)

describe('ChannelPerformanceBreakdownTableWrapper', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders ChannelPerformanceBreakdownTable when flag is disabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        render(<ChannelPerformanceBreakdownTableWrapper />)

        expect(
            screen.getByText('ChannelPerformanceBreakdownTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('AllAgentsPerformanceByChannelTable'),
        ).not.toBeInTheDocument()
    })

    it('renders AllAgentsPerformanceByChannelTable when flag is enabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        render(<ChannelPerformanceBreakdownTableWrapper />)

        expect(
            screen.getByText('AllAgentsPerformanceByChannelTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('ChannelPerformanceBreakdownTable'),
        ).not.toBeInTheDocument()
    })

    it('renders ChannelPerformanceBreakdownTable while the flag is still loading', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: true,
        })

        render(<ChannelPerformanceBreakdownTableWrapper />)

        expect(
            screen.getByText('ChannelPerformanceBreakdownTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('AllAgentsPerformanceByChannelTable'),
        ).not.toBeInTheDocument()
    })
})
