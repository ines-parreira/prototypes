import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { createDragDropManager } from 'dnd-core'
import { fromJS } from 'immutable'
import { HTML5Backend } from 'react-dnd-html5-backend'
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
import type { ShopifyIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'
import { DndProvider } from 'utils/wrappers/DndProvider'

import EditReportOrderIssueFlowScenarioViewContainer from '../EditReportOrderIssueFlowScenarioViewContainer'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')

jest.mock('hooks/useAppDispatch', () => () => jest.fn())

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    Redirect: jest.fn(() => <div>Redirect</div>),
}))
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(() => true),
}))

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const manager = createDragDropManager(HTML5Backend, undefined, undefined)

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
} as unknown as RootState

describe('<TrackOrderFlowViewContainer />', () => {
    beforeEach(() => {
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: { id: 1 } as ShopifyIntegration,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                articleRecommendationHelpCenterId: 1,
                reportIssuePolicy: {
                    cases: [
                        {
                            title: 'Order not received',
                            conditions: {},
                            description: 'order not received',
                            newReasons: [
                                {
                                    reasonKey: 'order_not_received',
                                    action: {
                                        showHelpfulPrompt: true,
                                        type: 'automated_response',
                                        responseMessageContent: {
                                            html: 'Order not received',
                                            text: 'Order not received',
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                    enabled: true,
                },
            },
            handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
        })
    })

    it('should redirect if not automate subscribed', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <EditReportOrderIssueFlowScenarioViewContainer />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Redirect')).toBeInTheDocument()
    })

    it('should render track order flow', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <DndProvider manager={manager}>
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
                        <EditReportOrderIssueFlowScenarioViewContainer />
                    </Provider>
                </DndProvider>
            </QueryClientProvider>,
            {
                path: `/app/automation/:shopType/:shopName/order-management/report-issue/:scenarioIndex`,
                route: '/app/automation/shopify/shop-name/order-management/report-issue/0',
            },
        )

        expect(screen.getByText('Scenario description')).toBeInTheDocument()
    })
})
