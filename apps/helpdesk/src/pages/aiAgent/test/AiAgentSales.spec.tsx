// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { AGENT_ROLE } from 'config/user'
import { HTTP_INTEGRATION_TYPE } from 'constants/integration'
import {
    HELPDESK_PRODUCT_ID,
    legacyBasicHelpdeskPlan,
    products,
} from 'fixtures/plans'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import { AiAgentSales } from '../AiAgentSales'
import { useGetShoppingAssistantEnabled } from '../hooks/useGetShoppingAssistantEnabled'

jest.mock('../AiAgentPaywallView', () => ({
    AiAgentPaywallView: jest.fn(() => (
        <div data-testid="ai-agent-paywall-view" />
    )),
}))

jest.mock('../components/SalesSettings/SalesSettings', () => ({
    SalesSettings: jest.fn(() => <div data-testid="sales-settings" />),
}))

jest.mock('../hooks/useGetShoppingAssistantEnabled')

const mockHistoryPush = jest.fn()
const mockHistoryReplace = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
        replace: mockHistoryReplace,
    }),
}))

const queryClient = mockQueryClient()
const defaultState = {
    integrations: fromJS({
        integrations: [{ type: HTTP_INTEGRATION_TYPE }],
    }),
    ticket: fromJS(ticket),
    currentAccount: fromJS({
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: legacyBasicHelpdeskPlan.plan_id,
            },
        },
    }),
    currentUser: fromJS({
        ...user,
        role: { name: AGENT_ROLE },
    }),
    billing: fromJS({ products }),
}

const mockUseGetShoppingAssistantEnabled =
    useGetShoppingAssistantEnabled as jest.Mock

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider client={queryClient}>
                <AiAgentSales />
            </QueryClientProvider>
        </Provider>,
        {
            path: '/app/ai-agent/:shopType/:shopName/sales',
            route: '/app/ai-agent/shopify/test-shop/sales',
        },
    )

describe('<AiAgentSales />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
        )
    })

    it('should render without error', async () => {
        mockUseGetShoppingAssistantEnabled.mockReturnValue({
            isEnabled: true,
            isLoading: false,
        })

        renderComponent()

        await waitFor(() => {
            expect(screen.getByTestId('sales-settings')).toBeInTheDocument()
        })
    })

    it('should redirect to strategy tab when shopping assistant is not enabled', async () => {
        mockUseGetShoppingAssistantEnabled.mockReturnValue({
            isEnabled: false,
            isLoading: false,
        })

        renderComponent()

        await waitFor(() => {
            expect(mockHistoryReplace).toHaveBeenCalledWith(
                '/app/ai-agent/shopify/test-shop/sales/strategy',
            )
        })
    })

    it('should redirect to strategy tab when shopping assistant is enabled', async () => {
        mockUseGetShoppingAssistantEnabled.mockReturnValue({
            isEnabled: true,
            isLoading: false,
        })

        renderComponent()

        await waitFor(() => {
            expect(mockHistoryReplace).toHaveBeenCalledWith(
                '/app/ai-agent/shopify/test-shop/sales/strategy',
            )
        })
    })

    it('should not redirect when data is loading', async () => {
        mockUseGetShoppingAssistantEnabled.mockReturnValue({
            isEnabled: false,
            isLoading: true,
        })

        renderComponent()

        await waitFor(() => {
            expect(mockHistoryReplace).not.toHaveBeenCalled()
        })
    })

    it('should not redirect when feature flag is disabled', async () => {
        mockUseFlag.mockReturnValue(false)

        mockUseGetShoppingAssistantEnabled.mockReturnValue({
            isEnabled: false,
            isLoading: false,
        })

        renderComponent()

        await waitFor(() => {
            expect(mockHistoryReplace).not.toHaveBeenCalled()
        })
    })
})
