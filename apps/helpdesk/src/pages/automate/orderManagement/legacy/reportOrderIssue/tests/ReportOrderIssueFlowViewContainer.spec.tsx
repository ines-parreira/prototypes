import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/plans'
import { selfServiceConfiguration1 } from 'fixtures/self_service_configurations'
import { IntegrationType } from 'models/integration/types'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import ReportOrderIssueFlowViewContainer from '../ReportOrderIssueFlowViewContainer'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    Redirect: jest.fn(() => <div>Redirect</div>),
}))

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const defaultState = {
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                name: 'test-shop',
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
} as unknown as RootState

describe('<ReportOrderIssueFlowViewContainer />', () => {
    beforeEach(() => {
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                articleRecommendationHelpCenterId: 1,
            },
            handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
        })
    })

    it('should redirect if not automate subscribed', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <ReportOrderIssueFlowViewContainer />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Redirect')).toBeInTheDocument()
    })

    it('should render track order flow', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider
                    store={mockStore({
                        ...defaultState,
                        currentAccount: fromJS({
                            ...account,
                            current_subscription: {
                                products: {
                                    [HELPDESK_PRODUCT_ID]:
                                        basicMonthlyHelpdeskPlan.plan_id,
                                    [AUTOMATION_PRODUCT_ID]:
                                        basicMonthlyAutomationPlan.plan_id,
                                },
                                status: 'active',
                            },
                        }),
                    })}
                >
                    <ReportOrderIssueFlowViewContainer />
                </Provider>
            </QueryClientProvider>,
        )

        expect(
            screen.getByText(/how to Customize the report order issue/i),
        ).toBeInTheDocument()
    })
})
