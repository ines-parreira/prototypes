import type { ReactNode } from 'react'

import { useFlagWithLoading } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { ChannelPerformanceBreakdownTableWrapper } from '../ChannelPerformanceBreakdownTableWrapper'

jest.mock('@gorgias/axiom', () => ({
    Box: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Skeleton: () => <div aria-label="Loading" />,
}))

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

    it('renders a loader while the flag is still loading', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: true,
        })

        render(<ChannelPerformanceBreakdownTableWrapper />)

        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
        expect(
            screen.queryByText('ChannelPerformanceBreakdownTable'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('AllAgentsPerformanceByChannelTable'),
        ).not.toBeInTheDocument()
    })
})
