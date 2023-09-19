import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import LD from 'launchdarkly-react-client-sdk'
import {RootState, StoreDispatch} from 'state/types'
import {
    HELPDESK_PRODUCT_ID,
    basicMonthlyHelpdeskPrice,
    currentProductsUsage,
    products,
} from 'fixtures/productPrices'
import {renderWithRouter} from 'utils/testing'
import {FeatureFlagKey} from 'config/featureFlags'
import BillingProcessView from '../BillingProcessView'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: jest.fn().mockReturnValue({
        selectedProduct: 'helpdesk',
    }),
}))

jest.mock('utils', () => {
    const utils: Record<string, unknown> = jest.requireActual('utils')
    return {
        ...utils,
        loadScript: jest.fn(),
    }
})

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
        currentProductsUsage: {
            helpdesk: {
                data: {
                    extra_tickets_cost_in_cents: 0,
                    num_extra_tickets: 0,
                    num_tickets: 0,
                },
                meta: {
                    subscription_start_datetime: '2021-01-01T00:00:00Z',
                    subscription_end_datetime: '2021-02-01T00:00:00Z',
                },
            },
            automation: null,
            voice: null,
            sms: null,
        },
    }),
})

describe('UsageAndPlansView', () => {
    it('should render', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ConvertBilling]: true,
        }))

        const {container} = renderWithRouter(
            <Provider store={store}>
                <BillingProcessView
                    currentUsage={currentProductsUsage}
                    contactBilling={jest.fn()}
                    dispatchBillingError={jest.fn()}
                    setDefaultMessage={jest.fn()}
                    setIsModalOpen={jest.fn()}
                    periodEnd="2021-01-01"
                    isTrialing={false}
                    isCurrentSubscriptionCanceled={false}
                />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
