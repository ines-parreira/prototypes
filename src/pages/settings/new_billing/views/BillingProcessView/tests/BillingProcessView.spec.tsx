import React from 'react'

import { screen, waitFor, within } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'

import {
    basicMonthlyHelpdeskPlan,
    currentProductsUsage,
    HELPDESK_PRODUCT_ID,
    products,
} from 'fixtures/productPrices'
import client from 'models/api/resources'
import {
    CommonReasonLabel,
    HelpdeskPrimaryReasonLabel,
} from 'pages/settings/new_billing/components/CancelProductModal/constants'
import { payingWithCreditCard } from 'pages/settings/new_billing/fixtures'
import { RootState } from 'state/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'
import { assumeMock } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

import ScheduledCancellationSummary from '../../../components/ScheduledCancellationSummary'
import BillingProcessView from '../BillingProcessView'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')
jest.mock(
    '../../../components/ScheduledCancellationSummary/ScheduledCancellationSummary',
    () =>
        jest.fn(() => <div data-testid="scheduled-cancellation-summary"></div>),
)

const ScheduledCancellationSummaryMock = assumeMock(
    ScheduledCancellationSummary,
)
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: jest.fn().mockReturnValue({
        selectedProduct: 'helpdesk',
    }),
}))

const mockedServer = new MockAdapter(client)

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

describe('UsageAndPlansView', () => {
    it('should render', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        const { container } = renderWithStoreAndQueryClientAndRouter(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            storeInitialState,
        )
        await waitFor(() => {
            expect(screen.queryByText('See Plans Details')).toBeInTheDocument()
        })

        expect(container).toMatchSnapshot()
    })

    it('should NOT render if subscription has been canceled', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        renderWithStoreAndQueryClientAndRouter(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={true}
            />,
            storeInitialState,
        )

        await waitFor(() => {
            expect(
                screen.queryByTestId('scheduled-cancellation-summary'),
            ).not.toBeInTheDocument()
        })
    })
    it('should render a scheduled cancellation summary if the subscription is scheduled to cancel', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        const scheduledToCancelAt = '2021-01-01T00:00:00Z'

        const alteredStore = {
            ...storeInitialState,
            currentAccount: fromJS({
                ...storeInitialState.currentAccount,
                current_subscription: fromJS({
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicMonthlyHelpdeskPlan.price_id,
                    },
                    scheduled_to_cancel_at: scheduledToCancelAt,
                }),
            }),
        } as Partial<RootState>

        renderWithStoreAndQueryClientProvider(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
            />,
            alteredStore,
        )

        await waitFor(() => {
            expect(
                screen.queryByTestId('scheduled-cancellation-summary'),
            ).toBeInTheDocument()
        })

        expect(ScheduledCancellationSummaryMock).toHaveBeenCalledWith(
            {
                scheduledToCancelAt: scheduledToCancelAt,
                onContactUs: expect.any(Function),
                cancelledProducts: ['Helpdesk'],
            },
            {},
        )
    })

    // TODO(React18): Fix this flaky test
    it.skip('should be required to add additional details to the cancellation reason when "Other" is selected as secondary reason', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        renderWithStoreAndQueryClientAndRouter(
            <BillingProcessView
                currentUsage={currentProductsUsage}
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
                setDefaultMessage={jest.fn()}
                setIsModalOpen={jest.fn()}
                periodEnd="2021-01-01"
                isTrialing={false}
                isCurrentSubscriptionCanceled={true}
            />,
            storeInitialState,
        )

        await waitFor(() => {
            screen.getByRole('button', {
                name: 'Cancel auto-renewal',
            })
            expect(
                screen.queryByText('Cancel Helpdesk auto-renewal'),
            ).not.toBeInTheDocument()
        })

        const cancelAutoRenewalButton = screen.getByRole('button', {
            name: 'Cancel auto-renewal',
        })

        userEvent.click(cancelAutoRenewalButton)

        await waitFor(() => {
            expect(
                screen.getByText('Cancel Helpdesk auto-renewal'),
            ).toBeVisible()
        })

        expect(
            screen.queryByText(
                'Your opinion means a lot to us. Please tell us why you are cancelling your plan.',
            ),
        ).not.toBeInTheDocument()

        userEvent.click(screen.getByText('Continue cancelling'))

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Your opinion means a lot to us. Please tell us why you are cancelling your plan.',
                ),
            ).toBeVisible()
        })

        userEvent.click(
            within(screen.getByRole('combobox')).getByText('arrow_drop_down'),
        )

        await waitFor(() => {
            expect(
                screen.getByRole('option', {
                    name: HelpdeskPrimaryReasonLabel.DoesNotFitMyNeeds,
                }),
            ).toBeVisible()
        })

        expect(
            screen.queryByText('Could you please share more?'),
        ).not.toBeInTheDocument()

        userEvent.click(
            screen.getByRole('option', {
                name: HelpdeskPrimaryReasonLabel.DoesNotFitMyNeeds,
            }),
        )

        await waitFor(() => {
            expect(
                screen.getByText('Could you please share more?'),
            ).toBeVisible()
        })

        expect(
            screen.queryByText('Please share any additional details'),
        ).not.toBeInTheDocument()

        userEvent.click(
            screen.getByRole('radio', {
                name: CommonReasonLabel.Other,
            }),
        )

        await waitFor(() => {
            expect(
                screen.getByText('Please share any additional details'),
            ).toBeVisible()
        })

        expect(
            screen.getByRole('button', { name: 'Continue cancelling' }),
        ).toBeAriaDisabled()

        await userEvent.type(
            screen.getByPlaceholderText("It didn't work out for me because..."),
            'Some other reason',
        )

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Continue cancelling' }),
            ).toBeAriaEnabled()
        })
    })
})
