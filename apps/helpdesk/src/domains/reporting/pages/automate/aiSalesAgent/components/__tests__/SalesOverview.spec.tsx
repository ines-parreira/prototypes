import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import SalesOverview from 'domains/reporting/pages/automate/aiSalesAgent/components/SalesOverview'
import { useWarningBannerIsDisplayed } from 'domains/reporting/pages/automate/aiSalesAgent/hooks/useWarningBannerIsDisplayed'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { useFirstStoreWithAiSalesData } from 'domains/reporting/pages/convert/hooks/useFirstStoreWithAiSalesData'
import { initialState as uiFiltersInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { user } from 'fixtures/users'
import { useStoreIntegrationByShopName } from 'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('pages/settings/helpCenter/hooks/useStoreIntegrationByShopName')
jest.mock('domains/reporting/pages/convert/hooks/useFirstStoreWithAiSalesData')
jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/hooks/useWarningBannerIsDisplayed',
)
jest.mock('pages/settings/helpCenter/hooks/useStoreIntegrationByShopName')
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Skeleton: () => <div>Skeleton</div>,
}))

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/components/RenderChart',
    () => ({
        RenderChart: () => <div>Mocked Chart</div>,
    }),
)

jest.mock('domains/reporting/pages/dashboards/DashboardComponent', () => ({
    DashboardComponent: () => <div>Mocked Dashboard Component</div>,
}))

const mockUseFirstStoreWithAiSalesData = assumeMock(
    useFirstStoreWithAiSalesData,
)
const mockUseWarningBannerIsDisplayed = assumeMock(useWarningBannerIsDisplayed)

const mockUseStoreIntegrationByShopName =
    useStoreIntegrationByShopName as jest.Mock
const mockUseHistory = useHistory as jest.Mock
const mockHistoryPush = jest.fn()
const mockHistoryReplace = jest.fn()

const queryClient = mockQueryClient()

const useFlagsMock = assumeMock(useFlags)

describe('<SalesOverview />', () => {
    const defaultState = {
        currentAccount: fromJS(account),
        currentUser: fromJS(user),
        billing: fromJS(billingState),
        integrations: fromJS({
            ...integrationsState,
            integrations: integrationsState.integrations.map(
                (integration: any) =>
                    integration.id === 1
                        ? { ...integration, name: 'test-shop', type: 'shopify' }
                        : integration,
            ),
        }),
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-05-29T00:00:00+02:00',
                    end_datetime: '2021-06-04T23:59:59+02:00',
                },
                storeIntegrations: {
                    values: [1],
                    operator: LogicalOperatorEnum.ONE_OF,
                },
            },
        },
        ui: {
            stats: {
                filters: uiFiltersInitialState,
            },
        },
    } as RootState
    const aiAgentShoppingAssistantPage = {
        path: '/app/ai-agent/:shopType/:shopName/sales/analytics',
        route: '/app/ai-agent/shopify/test-shop/sales/analytics',
    }

    const statsShoppingAssistantPage = {
        path: '/app/stats/ai-sales-agent/overview',
        route: '/app/stats/ai-sales-agent/overview',
    }

    const renderComponent = ({
        state = defaultState,
        path,
    }: {
        state?: RootState
        path: any
    }) => {
        return renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(state)}>
                    <SalesOverview />
                </Provider>
            </QueryClientProvider>,
            path,
        )
    }

    beforeEach(() => {
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
            [FeatureFlagKey.ActionDrivenAiAgentNavigation]: true,
        })
        mockUseFirstStoreWithAiSalesData.mockReturnValue({
            isLoading: false,
            storeId: 1,
        })
        mockUseWarningBannerIsDisplayed.mockReturnValue({
            isBannerDisplayed: false,
            isLoading: false,
            redirectionPath: '',
            redirectToChatSettings: jest.fn(),
        })
        mockUseStoreIntegrationByShopName.mockReturnValue({
            id: 1,
            name: 'test-shop',
            type: 'shopify',
        })
        mockUseHistory.mockReturnValue({
            push: mockHistoryPush,
            replace: mockHistoryReplace,
        })
    })

    describe.each([
        ['ai agent shopping assistant', aiAgentShoppingAssistantPage],
        ['stats shopping assistant', statsShoppingAssistantPage],
    ])('on the page %s', (path) => {
        it('should render loading state', () => {
            mockUseFirstStoreWithAiSalesData.mockReturnValue({
                isLoading: true,
                storeId: 1,
            })

            renderComponent({ path })
            expect(screen.getAllByText('Skeleton')).toHaveLength(3)
        })

        it('should render main metrics section', async () => {
            renderComponent({ path })
            await waitFor(() => {
                expect(screen.getByText('Main metrics')).toBeInTheDocument()
                expect(screen.getByText('Orders')).toBeInTheDocument()
                expect(
                    screen.getByText('Shopping Assistant performance'),
                ).toBeInTheDocument()
            })
        })

        it('should render discount section when feature flag is enabled', async () => {
            renderComponent({ path })
            await waitFor(() => {
                expect(screen.getByText(/Discounts/i)).toBeInTheDocument()
            })
        })

        it('should not render discount section when feature flag is disabled', async () => {
            useFlagsMock.mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: false,
            })
            renderComponent({ path })
            await waitFor(() => {
                expect(screen.queryByText(/Discounts/i)).not.toBeInTheDocument()
            })
        })

        it('should display warning banner when chat integration is not installed', async () => {
            mockUseWarningBannerIsDisplayed.mockReturnValue({
                isBannerDisplayed: true,
                isLoading: false,
                redirectionPath:
                    '/app/settings/channels/gorgias_chat/2/installation',
                redirectToChatSettings: jest.fn(),
            })
            renderComponent({ path })

            await waitFor(() => {
                expect(
                    screen.getByText(
                        /We cannot display Shopping Assistant's analytics/,
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Update Installation'),
                ).toBeInTheDocument()
            })
        })

        it('should not display warning banner when user is not admin', async () => {
            renderComponent({
                path,
                state: {
                    ...defaultState,
                    currentUser: fromJS({ ...user, role: { name: 'user' } }),
                },
            })

            await waitFor(() => {
                expect(
                    screen.queryByText(
                        /We cannot display Shopping Assistant's analytics/,
                    ),
                ).toBeNull()
            })
        })

        it('should not display warning banner when the chat integration is installed', async () => {
            renderComponent({ path })

            await waitFor(() => {
                expect(
                    screen.queryByText(
                        /We cannot display Shopping Assistant's analytics/,
                    ),
                ).toBeNull()
            })
        })

        it('should redirect to the chat integration installation page when the chat integration is not installed', async () => {
            const mockRedirectToChatSettings = jest.fn()
            mockUseWarningBannerIsDisplayed.mockReturnValue({
                isBannerDisplayed: true,
                isLoading: false,
                redirectionPath:
                    '/app/settings/channels/gorgias_chat/2/installation',
                redirectToChatSettings: mockRedirectToChatSettings,
            })

            renderComponent({ path })

            await waitFor(() => {
                expect(
                    screen.getByText('Update Installation'),
                ).toBeInTheDocument()
            })

            await userEvent.click(screen.getByText('Update Installation'))

            expect(mockRedirectToChatSettings).toHaveBeenCalled()
        })

        it('should replace history path when action-driven AI agent navigation is enabled and conditions match', () => {
            renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <SalesOverview />
                    </Provider>
                </QueryClientProvider>,
                {
                    route: '/app/stats/ai-sales-agent/overview/test-shop',
                    path: '/app/stats/ai-sales-agent/overview/:shopName',
                },
            )

            expect(mockHistoryReplace).toHaveBeenCalledWith(
                '/app/stats/ai-sales-agent/overview',
            )
        })
    })
})
