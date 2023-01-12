import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {account} from 'fixtures/account'
import {PaymentMethodType} from 'state/billing/types'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'

import BillingContainer from '../BillingContainer'

jest.mock('../BillingHelpdeskUsage', () => () => <div>Billing usage</div>)
jest.mock('../BillingPaymentMethod', () => () => (
    <div>Billing payment method</div>
))
jest.mock('../details/BillingDetails', () => () => <div>Billing details</div>)
jest.mock('../BillingInvoices', () => () => <div>Billing invoices</div>)
jest.mock('../AddOns', () => () => <div>AddOns</div>)

describe('<BillingContainer />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
            ...account,
            meta: {
                hasCreditCard: true,
            },
        }),
        billing: fromJS({}),
    }
    let store: MockStoreEnhanced<Partial<RootState>, StoreDispatch>

    beforeEach(() => {
        jest.clearAllMocks()
        store = mockStore(defaultState)
    })

    it('should render the billing page', () => {
        store = mockStore({
            ...defaultState,
            billing: fromJS({
                products: [],
            }),
        })

        const {container} = renderWithRouter(
            <Provider store={store}>
                <BillingContainer />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render billing details when the payment method is shopify', () => {
        store = mockStore({
            currentAccount: fromJS({
                meta: {},
            }),
            billing: fromJS({
                paymentMethod: PaymentMethodType.Shopify,
                products: [],
            }),
        })
        const {queryByText} = renderWithRouter(
            <Provider store={store}>
                <BillingContainer />
            </Provider>
        )

        expect(queryByText('Billing details')).toBeInTheDocument()
    })

    it("should not render billing details when the account doesn't have a credit card", () => {
        store = mockStore({
            ...defaultState,
            currentAccount: fromJS({
                meta: {},
            }),
            billing: fromJS({
                products: [],
            }),
        })

        const {queryByText} = renderWithRouter(
            <Provider store={store}>
                <BillingContainer />
            </Provider>
        )

        expect(queryByText('Billing details')).not.toBeInTheDocument()
    })

    it("should not render addons section when the account doesn't have an active subscription", () => {
        store = mockStore({
            ...defaultState,
            currentAccount: undefined,
        })

        const {queryByText} = renderWithRouter(
            <Provider store={store}>
                <BillingContainer />
            </Provider>
        )

        expect(queryByText('AddOns')).not.toBeInTheDocument()
    })
})
