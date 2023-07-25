import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {RootState, StoreDispatch} from 'state/types'
import {
    HELPDESK_PRODUCT_ID,
    basicMonthlyHelpdeskPrice,
    products,
} from 'fixtures/productPrices'
import {renderWithRouter} from 'utils/testing'
import BillingFrequencyView from '../BillingFrequencyView'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: jest.fn().mockReturnValue({
        selectedProduct: 'helpdesk',
    }),
}))

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const store = mockedStore({
    billing: fromJS({
        invoices: [],
        products,
        currentAccount: fromJS({
            current_subscription: {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPrice.price_id,
                },
            },
        }),
    }),
})

describe('UsageAndPlansView', () => {
    it('should render', () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <BillingFrequencyView
                    isTrialing={false}
                    periodEnd="2021-01-01"
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
