import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {RootState, StoreDispatch} from 'state/types'
import {
    CONVERT_PRODUCT_ID,
    convertPrice1,
    HELPDESK_PRODUCT_ID,
    legacyBasicHelpdeskPrice,
    products,
} from 'fixtures/productPrices'
import {assumeMock, renderWithRouter} from 'utils/testing'
import {BILLING_BASE_PATH} from 'pages/settings/new_billing/constants'
import useGetConvertStatus from 'pages/convert/common/hooks/useGetConvertStatus'
import {
    convertStatusLimitReached,
    convertStatusOkWarning,
    convertStatusOkWarningUpgrade,
} from 'fixtures/convert'
import BillingStartView from '../BillingStartView'
import {account} from '../../../../../../fixtures/account'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const store = mockedStore({
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: {
                [HELPDESK_PRODUCT_ID]: legacyBasicHelpdeskPrice.price_id,
                [CONVERT_PRODUCT_ID]: convertPrice1.price_id,
            },
        },
    }),
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

jest.mock('pages/convert/common/hooks/useGetConvertStatus')

const useGetConvertStatusMock = assumeMock(useGetConvertStatus)

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
    describe('Convert limit benner', () => {
        const limitReachedText = "You've reached the limit for your Convert"
        const upgradeText = 'you will be auto-upgraded'
        const warningText = 'campaigns will stop being displayed'

        it('should render a Convert limit-reached banner', () => {
            useGetConvertStatusMock.mockReturnValue(convertStatusLimitReached)

            const {queryByText} = renderWithRouter(
                <WrappedBillingStartView />,
                {
                    route: BILLING_BASE_PATH,
                }
            )

            expect(
                queryByText(limitReachedText, {exact: false})
            ).toBeInTheDocument()
        })

        it('should render a Convert auto-upgrade warning banner', () => {
            useGetConvertStatusMock.mockReturnValue(
                convertStatusOkWarningUpgrade
            )

            const {queryByText} = renderWithRouter(
                <WrappedBillingStartView />,
                {
                    route: BILLING_BASE_PATH,
                }
            )

            expect(queryByText(upgradeText, {exact: false})).toBeInTheDocument()
        })

        it('should render a Convert capping warning banner', () => {
            useGetConvertStatusMock.mockReturnValue(convertStatusOkWarning)

            const {queryByText} = renderWithRouter(
                <WrappedBillingStartView />,
                {
                    route: BILLING_BASE_PATH,
                }
            )

            expect(queryByText(warningText, {exact: false})).toBeInTheDocument()
        })

        it('should not render warming because estimation is outside of cycle', () => {
            useGetConvertStatusMock.mockReturnValue({
                ...convertStatusOkWarning,
                estimated_reach_date: '2023-04-01T00:00:00.000Z',
            })

            const {queryByText} = renderWithRouter(
                <WrappedBillingStartView />,
                {
                    route: BILLING_BASE_PATH,
                }
            )

            expect(
                queryByText(warningText, {exact: false})
            ).not.toBeInTheDocument()
        })
    })
})
