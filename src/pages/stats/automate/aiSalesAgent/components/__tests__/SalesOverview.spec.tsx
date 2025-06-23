import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Provider } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import { user } from 'fixtures/users'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useTrackingBundleInstallationWarningCheck } from 'pages/aiAgent/hooks/useTrackingBundleInstallationWarningCheck'
import { useStoreIntegrationByShopName } from 'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { useFirstStoreWithAiSalesData } from 'pages/stats/convert/hooks/useFirstStoreWithAiSalesData'
import { RootState } from 'state/types'
import { initialState as uiFiltersInitialState } from 'state/ui/stats/filtersSlice'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, mockStore, renderWithRouter } from 'utils/testing'

import SalesOverview from '../SalesOverview'

jest.mock('launchdarkly-react-client-sdk')
jest.mock('pages/settings/helpCenter/hooks/useStoreIntegrationByShopName')
jest.mock('pages/stats/convert/hooks/useFirstStoreWithAiSalesData')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
jest.mock('pages/aiAgent/hooks/useTrackingBundleInstallationWarningCheck')
jest.mock('pages/settings/helpCenter/hooks/useStoreIntegrationByShopName')
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

jest.mock('@gorgias/merchant-ui-kit', () => ({
    ...jest.requireActual('@gorgias/merchant-ui-kit'),
    Skeleton: () => <div>Skeleton</div>,
}))

jest.mock('pages/stats/automate/aiSalesAgent/components/RenderChart', () => ({
    RenderChart: () => <div>Mocked Chart</div>,
}))

jest.mock('pages/stats/dashboards/DashboardComponent', () => ({
    DashboardComponent: () => <div>Mocked Dashboard Component</div>,
}))

const mockUseFirstStoreWithAiSalesData = assumeMock(
    useFirstStoreWithAiSalesData,
)
const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockUseTrackingBundleInstallationWarningCheck = assumeMock(
    useTrackingBundleInstallationWarningCheck,
)

const mockUseStoreIntegrationByShopName =
    useStoreIntegrationByShopName as jest.Mock
const mockUseHistory = useHistory as jest.Mock
const mockHistoryPush = jest.fn()

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
        })
        mockUseFirstStoreWithAiSalesData.mockReturnValue({
            isLoading: false,
            storeId: 1,
        })
        mockUseStoreActivations.mockReturnValue({
            storeActivations: {
                'test-shop': {
                    configuration: {
                        monitoredChatIntegrations: [2],
                    },
                },
            },
            isFetchLoading: false,
        } as unknown as ReturnType<typeof useStoreActivations>)
        mockUseTrackingBundleInstallationWarningCheck.mockReturnValue({
            uninstalledChatIntegrationId: undefined,
        })
        mockUseStoreIntegrationByShopName.mockReturnValue({
            id: 1,
            name: 'test-shop',
            type: 'shopify',
        })
        mockUseHistory.mockReturnValue({ push: mockHistoryPush })
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
            mockUseTrackingBundleInstallationWarningCheck.mockReturnValue({
                uninstalledChatIntegrationId: 2,
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
            mockUseTrackingBundleInstallationWarningCheck.mockReturnValue({
                uninstalledChatIntegrationId: 2,
            })

            renderComponent({ path })

            await waitFor(() => {
                expect(
                    screen.getByText('Update Installation'),
                ).toBeInTheDocument()
            })

            await userEvent.click(screen.getByText('Update Installation'))
            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/settings/channels/gorgias_chat/2/installation',
            )
        })
    })
})
