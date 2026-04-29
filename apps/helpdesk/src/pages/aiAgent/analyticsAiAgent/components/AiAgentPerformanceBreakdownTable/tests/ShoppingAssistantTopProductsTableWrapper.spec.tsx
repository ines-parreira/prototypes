import { useFlagWithLoading } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { ShoppingAssistantTopProductsTableWrapper } from '../ShoppingAssistantTopProductsTableWrapper'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiAgentAnalyticsDashboardsTables:
            'linear.project_revamp-ai-agent-analytics-dashboards.tables',
    },
    useFlagWithLoading: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantTopProductsTable',
    () => ({
        ShoppingAssistantTopProductsTable: () => (
            <div>ShoppingAssistantTopProductsTable</div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/ShoppingAssistantTopProductsTable',
    () => ({
        ShoppingAssistantTopProductsTable: () => (
            <div>LegacyShoppingAssistantTopProductsTable</div>
        ),
    }),
)

const mockedUseFlagWithLoading = jest.mocked(useFlagWithLoading)

describe('ShoppingAssistantTopProductsTableWrapper', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the legacy table when the flag is disabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        render(<ShoppingAssistantTopProductsTableWrapper />)

        expect(
            screen.getByText('LegacyShoppingAssistantTopProductsTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('ShoppingAssistantTopProductsTable'),
        ).not.toBeInTheDocument()
    })

    it('renders the new table when the flag is enabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        render(<ShoppingAssistantTopProductsTableWrapper />)

        expect(
            screen.getByText('ShoppingAssistantTopProductsTable'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('LegacyShoppingAssistantTopProductsTable'),
        ).not.toBeInTheDocument()
    })

    it('renders a loading skeleton while the flag is still loading', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: true,
        })

        render(<ShoppingAssistantTopProductsTableWrapper />)

        expect(
            screen.queryByText('LegacyShoppingAssistantTopProductsTable'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('ShoppingAssistantTopProductsTable'),
        ).not.toBeInTheDocument()
    })
})
