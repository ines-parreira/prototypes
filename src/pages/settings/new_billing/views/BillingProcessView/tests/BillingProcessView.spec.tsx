import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {QueryClientProvider} from '@tanstack/react-query'
import {RootState, StoreDispatch} from 'state/types'
import {
    HELPDESK_PRODUCT_ID,
    basicMonthlyHelpdeskPlan,
    currentProductsUsage,
    products,
} from 'fixtures/productPrices'
import {assumeMock, renderWithRouter} from 'utils/testing'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import BillingProcessView from '../BillingProcessView'
import ScheduledCancellationSummary from '../../../components/ScheduledCancellationSummary'

const queryClient = mockQueryClient()
const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')
jest.mock(
    '../../../components/ScheduledCancellationSummary/ScheduledCancellationSummary',
    () =>
        jest.fn(() => <div data-testid="scheduled-cancellation-summary"></div>)
)
const ScheduledCancellationSummaryMock = assumeMock(
    ScheduledCancellationSummary
)
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
    currentAccount: fromJS({
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
            },
            scheduled_to_cancel_at: null,
        },
    }),
})

describe('UsageAndPlansView', () => {
    it('should render', () => {
        const {container} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
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
            </QueryClientProvider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should NOT render if subscription has been canceled', () => {
        const {queryByTestId} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <BillingProcessView
                        currentUsage={currentProductsUsage}
                        contactBilling={jest.fn()}
                        dispatchBillingError={jest.fn()}
                        setDefaultMessage={jest.fn()}
                        setIsModalOpen={jest.fn()}
                        periodEnd="2021-01-01"
                        isTrialing={false}
                        isCurrentSubscriptionCanceled={true}
                    />
                </Provider>
            </QueryClientProvider>
        )

        expect(
            queryByTestId('scheduled-cancellation-summary')
        ).not.toBeInTheDocument()
    })

    it('should render a scheduled cancellation summary if the subscription is scheduled to cancel', () => {
        const scheduledToCancelAt = '2021-01-01T00:00:00Z'
        const alteredStore = mockedStore({
            ...store.getState(),
            currentAccount: fromJS({
                ...store.getState().currentAccount,
                current_subscription: fromJS({
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicMonthlyHelpdeskPlan.price_id,
                    },
                    scheduled_to_cancel_at: scheduledToCancelAt,
                }),
            }),
        })

        const {queryByTestId} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={alteredStore}>
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
            </QueryClientProvider>
        )

        expect(
            queryByTestId('scheduled-cancellation-summary')
        ).toBeInTheDocument()

        expect(ScheduledCancellationSummaryMock).toHaveBeenCalledWith(
            {
                scheduledToCancelAt: scheduledToCancelAt,
                onContactUs: expect.any(Function),
                cancelledProducts: ['Helpdesk'],
            },
            {}
        )
    })
})
