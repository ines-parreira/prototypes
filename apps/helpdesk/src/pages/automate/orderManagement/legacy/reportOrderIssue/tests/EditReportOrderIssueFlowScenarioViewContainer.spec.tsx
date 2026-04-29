import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

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
import type { RootState } from 'state/types'

import EditReportOrderIssueFlowScenarioViewContainer from '../EditReportOrderIssueFlowScenarioViewContainer'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock(
    'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels',
    () => ({
        useChatPreviewChannelsContext: jest.fn().mockReturnValue({
            shopName: 'my-store',
            selectedChannelId: undefined,
            setSelectedChannelId: jest.fn(),
        }),
    }),
)
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    Redirect: jest.fn(() => <div>Redirect</div>),
}))
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(() => true),
}))
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
        render(<EditReportOrderIssueFlowScenarioViewContainer />, {
            storeState: defaultState,
        })
        expect(screen.getByText('Redirect')).toBeInTheDocument()
    })
    it('should render track order flow', () => {
        render(<EditReportOrderIssueFlowScenarioViewContainer />, {
            path: `/app/automation/:shopType/:shopName/order-management/report-issue/:scenarioIndex`,
            initialEntries: [
                '/app/automation/shopify/shop-name/order-management/report-issue/0',
            ],
            storeState: {
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
            },
        })
        expect(screen.getByText('Scenario description')).toBeInTheDocument()
    })
})
