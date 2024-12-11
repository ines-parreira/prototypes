import {QueryClientProvider} from '@tanstack/react-query'
import {screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    HELPDESK_PRODUCT_ID,
    basicMonthlyHelpdeskPlan,
    currentProductsUsage,
    products,
} from 'fixtures/productPrices'
import {
    CommonReasonLabel,
    HelpdeskPrimaryReasonLabel,
} from 'pages/settings/new_billing/components/CancelProductModal/constants'
import {RootState, StoreDispatch} from 'state/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock, renderWithRouter} from 'utils/testing'

import ScheduledCancellationSummary from '../../../components/ScheduledCancellationSummary'
import BillingProcessView from '../BillingProcessView'

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

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const storeInitialState = {
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
}

const store = mockedStore(storeInitialState)

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

    it('should be required to add additional details to the cancellation reason when "Other" is selected as secondary reason', async () => {
        renderWithRouter(
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

        const cancelAutoRenewalButton = screen.getByRole('button', {
            name: 'Cancel auto-renewal',
        })

        expect(
            screen.queryByText('Cancel Helpdesk auto-renewal')
        ).not.toBeInTheDocument()

        userEvent.click(cancelAutoRenewalButton)

        await waitFor(() => {
            expect(
                screen.getByText('Cancel Helpdesk auto-renewal')
            ).toBeVisible()
        })

        expect(
            screen.queryByText(
                'Your opinion means a lot to us. Please tell us why you are cancelling your plan.'
            )
        ).not.toBeInTheDocument()

        userEvent.click(screen.getByText('Continue cancelling'))

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Your opinion means a lot to us. Please tell us why you are cancelling your plan.'
                )
            ).toBeVisible()
        })

        userEvent.click(
            within(screen.getByRole('combobox')).getByText('arrow_drop_down')
        )

        await waitFor(() => {
            expect(
                screen.getByRole('option', {
                    name: HelpdeskPrimaryReasonLabel.DoesNotFitMyNeeds,
                })
            ).toBeVisible()
        })

        expect(
            screen.queryByText('Could you please share more?')
        ).not.toBeInTheDocument()

        userEvent.click(
            screen.getByRole('option', {
                name: HelpdeskPrimaryReasonLabel.DoesNotFitMyNeeds,
            })
        )

        await waitFor(() => {
            expect(
                screen.getByText('Could you please share more?')
            ).toBeVisible()
        })

        expect(
            screen.queryByText('Please share any additional details')
        ).not.toBeInTheDocument()

        userEvent.click(
            screen.getByRole('radio', {
                name: CommonReasonLabel.Other,
            })
        )

        await waitFor(() => {
            expect(
                screen.getByText('Please share any additional details')
            ).toBeVisible()
        })

        expect(
            screen.getByRole('button', {name: 'Continue cancelling'})
        ).toBeAriaDisabled()

        await userEvent.type(
            screen.getByPlaceholderText("It didn't work out for me because..."),
            'Some other reason'
        )

        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: 'Continue cancelling'})
            ).toBeAriaEnabled()
        })
    })
})
