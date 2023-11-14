import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {RootState, StoreDispatch} from 'state/types'
import {products} from 'fixtures/productPrices'
import {renderWithRouter} from 'utils/testing'
import {BILLING_BASE_PATH} from 'pages/settings/new_billing/constants'
import BillingStartView from '../BillingStartView'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const store = mockedStore({
    billing: fromJS({invoices: [], products, currentProductsUsage: {}}),
})

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

// Mock action creators
jest.mock('state/billing/actions', () => {
    const actions: Record<string, unknown> = jest.requireActual(
        'state/billing/actions'
    )
    return {
        ...actions,
        fetchCurrentProductsUsage: () =>
            jest.fn().mockResolvedValue({
                type: 'FETCH_CURRENT_PRODUCTS_USAGE_SUCCESS',
            }),
    }
})

jest.mock('pages/settings/revenue/hooks/useGetConvertStatus')

const WrappedBillingStartView = () => (
    <Provider store={store}>
        <BillingStartView />
    </Provider>
)

describe('BillingStartView', () => {
    it('should render a BillingStartView component and load the Usage & Plans view', () => {
        const {container} = renderWithRouter(<WrappedBillingStartView />, {
            route: BILLING_BASE_PATH,
        })

        expect(container).toMatchSnapshot()
    })
})
