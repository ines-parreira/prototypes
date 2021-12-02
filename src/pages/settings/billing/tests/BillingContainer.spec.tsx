import React, {Component} from 'react'
import {fromJS, Map} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {renderWithRouter} from '../../../../utils/testing'
import {StoreDispatch} from '../../../../state/types'
import {PaymentMethodType} from '../../../../state/billing/types'
import BillingContainer from '../BillingContainer.js'

// $TsFixMe remove cast on BillingContainer migration
const TypeSafeBillingContainer = BillingContainer as unknown as typeof Component

type MockedRootState = {
    currentAccount: Map<any, any>
    billing: Map<any, any>
}

jest.mock('../BillingUsage', () => () => <div>Billing usage</div>)
jest.mock('../BillingPaymentMethod', () => () => (
    <div>Billing payment method</div>
))
jest.mock('../details/BillingDetails', () => () => (
    <div data-testid="BillingDetails">Billing details</div>
))
jest.mock('../BillingInvoices', () => () => <div>Billing invoices</div>)

describe('<BillingContainer />', () => {
    const mockStore = configureMockStore<MockedRootState, StoreDispatch>([
        thunk,
    ])
    const defaultState = {
        currentAccount: fromJS({
            meta: {
                hasCreditCard: true,
            },
        }),
        billing: fromJS({}),
    }
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>

    beforeEach(() => {
        jest.clearAllMocks()
        store = mockStore(defaultState)
    })

    it('should render the billing page', () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <TypeSafeBillingContainer />
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
            }),
        })
        const {getByTestId} = renderWithRouter(
            <Provider store={store}>
                <TypeSafeBillingContainer />
            </Provider>
        )

        expect(getByTestId('BillingDetails')).toBeTruthy()
    })

    it("should not render billing details when the account doesn't have a credit card", () => {
        store = mockStore({
            ...defaultState,
            currentAccount: fromJS({
                meta: {},
            }),
        })

        const {queryByTestId} = renderWithRouter(
            <Provider store={store}>
                <TypeSafeBillingContainer />
            </Provider>
        )

        expect(queryByTestId('BillingDetails')).toBeFalsy()
    })
})
