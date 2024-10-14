import React from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {IntegrationType, ShopifyIntegration} from 'models/integration/types'
import {account} from 'fixtures/account'
import {renderWithRouter} from 'utils/testing'
import {RootState, StoreDispatch} from 'state/types'
import {
    AUTOMATION_PRODUCT_ID,
    HELPDESK_PRODUCT_ID,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
} from 'fixtures/productPrices'
import {selfServiceConfiguration1} from 'fixtures/self_service_configurations'
import {billingState} from 'fixtures/billing'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import ReturnOrderFlowViewContainer from '../ReturnOrderFlowViewContainer'

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    Redirect: jest.fn(() => <div>Redirect</div>),
}))
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
} as unknown as RootState

describe('<ReturnOrderFlowViewContainer />', () => {
    beforeEach(() => {
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: {id: 1} as ShopifyIntegration,
            selfServiceConfiguration: selfServiceConfiguration1,
            handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
        })
    })

    it('should redirect if not automate subscribed', () => {
        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <ReturnOrderFlowViewContainer />
            </Provider>
        )

        expect(screen.getByText('Redirect')).toBeInTheDocument()
    })

    it('should render return order flow', () => {
        renderWithRouter(
            <Provider
                store={mockStore({
                    ...defaultState,
                    currentAccount: fromJS({
                        ...account,
                        current_subscription: {
                            products: {
                                [HELPDESK_PRODUCT_ID]:
                                    basicMonthlyHelpdeskPlan.price_id,
                                [AUTOMATION_PRODUCT_ID]:
                                    basicMonthlyAutomationPlan.price_id,
                            },
                            status: 'active',
                        },
                    }),
                })}
            >
                <ReturnOrderFlowViewContainer />
            </Provider>
        )

        expect(screen.getByText('Return order')).toBeInTheDocument()
    })
})
