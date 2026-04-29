import type { ReactNode } from 'react'

import { useFlagWithLoading } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { SupportAgentIntentPerformanceBreakdownTableWrapper } from '../SupportAgentIntentPerformanceBreakdownTableWrapper'

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
    'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/IntentPerformanceBreakdownTable',
    () => ({
        IntentPerformanceBreakdownTable: () => (
            <div>IntentPerformanceBreakdownTable</div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/SupportAgentsPerformanceByIntentTable',
    () => ({
        SupportAgentsPerformanceByIntentTable: () => (
            <div>SupportAgentsPerformanceByIntentTable</div>
        ),
    }),
)

const mockedUseFlagWithLoading = jest.mocked(useFlagWithLoading)

describe('SupportAgentIntentPerformanceBreakdownTableWrapper', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders IntentPerformanceBreakdownTable when flag is disabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        render(<SupportAgentIntentPerformanceBreakdownTableWrapper />)

        expect(
            screen.getByText('IntentPerformanceBreakdownTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('SupportAgentsPerformanceByIntentTable'),
        ).not.toBeInTheDocument()
    })

    it('renders SupportAgentsPerformanceByIntentTable when flag is enabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        render(<SupportAgentIntentPerformanceBreakdownTableWrapper />)

        expect(
            screen.getByText('SupportAgentsPerformanceByIntentTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('IntentPerformanceBreakdownTable'),
        ).not.toBeInTheDocument()
    })

    it('renders a loader while the flag is still loading', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: true,
        })

        render(<SupportAgentIntentPerformanceBreakdownTableWrapper />)

        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
        expect(
            screen.queryByText('IntentPerformanceBreakdownTable'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('SupportAgentsPerformanceByIntentTable'),
        ).not.toBeInTheDocument()
    })
})
