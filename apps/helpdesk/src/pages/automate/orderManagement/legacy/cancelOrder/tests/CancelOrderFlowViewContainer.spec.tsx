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
import { selfServiceConfiguration1 as mockSelfServiceConfiguration } from 'fixtures/self_service_configurations'
import type { ShopifyIntegration } from 'models/integration/types'
import { useSelfServiceConfiguration } from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import type { RootState } from 'state/types'

import { CancelOrderFlowViewContainer } from '../CancelOrderFlowViewContainer'

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
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    Redirect: jest.fn(() => <div>Redirect</div>),
}))
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(() => true),
    useFlagWithLoading: jest.fn(() => ({ value: true, isLoading: false })),
}))
const defaultState = {
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [
            { type: 'email', meta: { address: 'test@gorgias.com' } },
        ],
    }),
    entities: {
        contactForm: {
            contactFormsAutomationSettings: {},
        },
        chatsApplicationAutomationSettings: {},
    },
} as unknown as RootState
describe('<ArticleRecommendationPreview />', () => {
    beforeEach(() => {
        ;(useSelfServiceConfiguration as jest.Mock).mockReturnValue({
            selfServiceConfiguration: mockSelfServiceConfiguration,
            storeIntegration: { id: 1 } as ShopifyIntegration,
            isFetchPending: false,
        })
    })
    it('should redirect if not automate subscribed', () => {
        render(<CancelOrderFlowViewContainer />, {
            storeState: defaultState,
        })
        expect(screen.getByText('Redirect')).toBeInTheDocument()
    })
    it('should render cancel order flow view', () => {
        render(<CancelOrderFlowViewContainer />, {
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
        expect(screen.getByText('Cancel order')).toBeInTheDocument()
    })
})
