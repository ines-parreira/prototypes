import type { ReactNode } from 'react'

import { useFlagWithLoading } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'

import { ShoppingAssistantChannelTableWrapper } from '../ShoppingAssistantChannelTableWrapper'

jest.mock('@gorgias/axiom', () => ({
    Box: ({ children }: { children: ReactNode }) => <div>{children}</div>,
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
    'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/ShoppingAssistantChannelTable',
    () => ({
        ShoppingAssistantChannelTable: () => (
            <div>ShoppingAssistantChannelTable</div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/AiAgentSalesPerformanceByChannelTable',
    () => ({
        AiAgentSalesPerformanceByChannelTable: () => (
            <div>AiAgentSalesPerformanceByChannelTable</div>
        ),
    }),
)

const mockedUseFlagWithLoading = jest.mocked(useFlagWithLoading)

describe('ShoppingAssistantChannelTableWrapper', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders ShoppingAssistantChannelTable when flag is disabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        render(<ShoppingAssistantChannelTableWrapper />)

        expect(
            screen.getByText('ShoppingAssistantChannelTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('AiAgentSalesPerformanceByChannelTable'),
        ).not.toBeInTheDocument()
    })

    it('renders AiAgentSalesPerformanceByChannelTable when flag is enabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        render(<ShoppingAssistantChannelTableWrapper />)

        expect(
            screen.getByText('AiAgentSalesPerformanceByChannelTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('ShoppingAssistantChannelTable'),
        ).not.toBeInTheDocument()
    })

    it('renders a loader while the flag is still loading', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: true,
        })

        render(<ShoppingAssistantChannelTableWrapper />)

        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
        expect(
            screen.queryByText('ShoppingAssistantChannelTable'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('AiAgentSalesPerformanceByChannelTable'),
        ).not.toBeInTheDocument()
    })
})
