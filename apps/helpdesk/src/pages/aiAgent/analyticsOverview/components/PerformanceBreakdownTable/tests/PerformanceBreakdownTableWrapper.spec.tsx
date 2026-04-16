import type { ReactNode } from 'react'

import { useFlagWithLoading } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'

import { PerformanceBreakdownTableWrapper } from '../PerformanceBreakdownTableWrapper'

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
    'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/PerformanceBreakdownTable',
    () => ({
        PerformanceBreakdownTable: () => <div>PerformanceBreakdownTable</div>,
    }),
)

jest.mock(
    'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/PerformanceBreakdownTableV2',
    () => ({
        PerformanceBreakdownTableV2: () => (
            <div>PerformanceBreakdownTableV2</div>
        ),
    }),
)

const mockedUseFlagWithLoading = jest.mocked(useFlagWithLoading)

describe('PerformanceBreakdownTableWrapper', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders PerformanceBreakdownTable when flag is disabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        render(<PerformanceBreakdownTableWrapper />)

        expect(
            screen.getByText('PerformanceBreakdownTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('PerformanceBreakdownTableV2'),
        ).not.toBeInTheDocument()
    })

    it('renders PerformanceBreakdownTableV2 when flag is enabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        render(<PerformanceBreakdownTableWrapper />)

        expect(
            screen.getByText('PerformanceBreakdownTableV2'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('PerformanceBreakdownTable'),
        ).not.toBeInTheDocument()
    })

    it('renders a loader while the flag is still loading', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: true,
        })

        render(<PerformanceBreakdownTableWrapper />)

        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
        expect(
            screen.queryByText('PerformanceBreakdownTable'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('PerformanceBreakdownTableV2'),
        ).not.toBeInTheDocument()
    })
})
