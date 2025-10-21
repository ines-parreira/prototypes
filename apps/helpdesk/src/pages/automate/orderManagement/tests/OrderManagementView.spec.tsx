import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { logEvent, SegmentEvent } from 'common/segment'
import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import { selfServiceConfiguration1 as mockSelfServiceConfiguration } from 'fixtures/self_service_configurations'
import { IntegrationType, ShopifyIntegration } from 'models/integration/types'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import OrderManagementView from '../OrderManagementView'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('common/segment')
jest.mock('core/flags')

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>
const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const defaultState = {
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                name: 'shop-name',
                meta: {},
            },
        ],
    }),
    entities: {
        contactForm: {
            contactFormsAutomationSettings: {},
        },
        chatsApplicationAutomationSettings: {},
    },
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
                [AUTOMATION_PRODUCT_ID]: basicMonthlyAutomationPlan.price_id,
            },
            status: 'active',
        },
    }),
} as unknown as RootState

const renderComponent = (state = defaultState) => {
    return renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state)}>
                <OrderManagementView />
            </Provider>
        </QueryClientProvider>,
        {
            route: '/a/1/automate/order-management/integrations/shopify/test-shop',
        },
    )
}

describe('<OrderManagementView />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfiguration,
            storeIntegration: { id: 1 } as ShopifyIntegration,
            isFetchPending: false,
            isUpdatePending: false,
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })
        mockUseFlag.mockReturnValue(false)
    })

    describe('feature flag tracking', () => {
        it('should call useFlag with ChangeAutomateSettingButtomPosition flag', () => {
            renderComponent()

            expect(mockUseFlag).toHaveBeenCalledWith(
                FeatureFlagKey.ChangeAutomateSettingButtomPosition,
            )
        })

        it('should log AutomateSettingPageViewed event when flag is enabled', async () => {
            mockUseFlag.mockReturnValue(true)

            renderComponent()

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AutomateSettingPageViewed,
                    {
                        page: 'Order Management',
                    },
                )
            })
        })

        it('should not log AutomateSettingPageViewed event when flag is disabled', async () => {
            mockUseFlag.mockReturnValue(false)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Track order')).toBeInTheDocument()
            })

            expect(mockLogEvent).not.toHaveBeenCalled()
        })

        it('should log event only once on mount when flag is enabled', async () => {
            mockUseFlag.mockReturnValue(true)

            const { rerender } = renderComponent()

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledTimes(1)
            })

            rerender(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <OrderManagementView />
                    </Provider>
                </QueryClientProvider>,
            )

            expect(mockLogEvent).toHaveBeenCalledTimes(1)
        })
    })

    describe('component rendering', () => {
        it('should render all order management flow items', async () => {
            renderComponent()

            await waitFor(() => {
                expect(screen.getByText('Track order')).toBeInTheDocument()
                expect(screen.getByText('Return order')).toBeInTheDocument()
                expect(screen.getByText('Cancel order')).toBeInTheDocument()
                expect(
                    screen.getByText('Report order issue'),
                ).toBeInTheDocument()
            })
        })
    })
})
