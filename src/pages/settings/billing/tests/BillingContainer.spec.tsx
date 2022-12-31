import React from 'react'
import {fromJS} from 'immutable'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {PaymentMethodType} from 'state/billing/types'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'

import BillingContainer from '../BillingContainer'

jest.mock('../BillingHelpdeskUsage', () => () => <div>Billing usage</div>)
jest.mock('../BillingPaymentMethod', () => () => (
    <div>Billing payment method</div>
))
jest.mock('../details/BillingDetails', () => () => (
    <div data-testid="BillingDetails">Billing details</div>
))
jest.mock('../BillingInvoices', () => () => <div>Billing invoices</div>)

describe('<BillingContainer />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const defaultState: Partial<RootState> = {
        currentAccount: fromJS({
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
        jest.spyOn(global.Date, 'now').mockImplementation(() => 1672617660000)

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
        ;(global.Date.now as unknown as jest.SpyInstance).mockRestore()
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
        const {getByTestId} = renderWithRouter(
            <Provider store={store}>
                <BillingContainer />
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
            billing: fromJS({
                products: [],
            }),
        })

        const {queryByTestId} = renderWithRouter(
            <Provider store={store}>
                <BillingContainer />
            </Provider>
        )

        expect(queryByTestId('BillingDetails')).toBeFalsy()
    })
})
