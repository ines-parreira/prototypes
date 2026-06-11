import client from '@repo/api-resources'
import { BILLING_INTERNAL_MANAGE_PLAN_PATH } from '@repo/billing'
import { payingWithCreditCard, trial, usages } from '@repo/billing/fixtures'
import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'

import { toast } from '@gorgias/axiom'

import { account } from 'fixtures/account'
import { useAppDispatch } from 'hooks/useAppDispatch'
import type {
    BillingState,
    CouponSummary,
    UpcomingInvoiceSummary,
} from 'models/billing/types'
import { ProductType, SubscriptionStatus } from 'models/billing/types'
import { BillingInternalViewUI } from 'pages/settings/new_billing/components/BillingInternalViewUI/BillingInternalViewUI'
import type { RootState } from 'state/types'

const mockedServer = new MockAdapter(client)

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockHistoryPush }),
}))

const availableHdAoCoupons = [
    'sales-hd+ao-year-05%-once',
    'sales-hd+ao-year-10%-once',
]
const hdAoCoupon: CouponSummary = {
    name: 'sales-hd+ao-month-15%-12months',
    duration: 'repeating',
    duration_in_months: 12,
    amount_off_in_cents: null,
    amount_off_decimal: null,
    percent_off: 15,
    products: [ProductType.Helpdesk, ProductType.Automation],
}

const upcomingInvoiceWithHdAoCouponApplied: UpcomingInvoiceSummary = {
    coupon: hdAoCoupon,
    subtotal_in_cents: 10000,
    subtotal_decimal: '100',
    total_in_cents: 8500,
    total_decimal: '85',
    usages: usages,
}

const extendedTrial = {
    ...trial,
    customer: {
        ...trial.customer,
        trial_extended_until:
            trial.subscription.current_billing_cycle_end_datetime,
    },
}

const extendedTrialOverAndUnconverted = {
    ...extendedTrial,
    subscription: {
        ...extendedTrial.subscription,
        status: SubscriptionStatus.CANCELED,
    },
}

const trialWithHdAoCoupon = {
    ...trial,
    subscription: {
        ...trial.subscription,
        coupon: hdAoCoupon,
    },
    upcoming_invoice: upcomingInvoiceWithHdAoCouponApplied,
}

const BillingInternalViewUIDefaultProps = {
    helpdeskAndAutomateCoupons: availableHdAoCoupons,
    helpdeskOnlyCoupons: [],
    automateOnlyCoupons: [],
}
// Mock the use of const dispatch = useAppDispatch()
jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock
const dispatch = jest.fn()
useAppDispatchMock.mockReturnValue(dispatch)

describe('BillingInternalViewUI', () => {
    beforeEach(() => {
        mockedServer.reset()
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)
    })

    afterEach(() => {
        jest.useRealTimers()
        toast.dismiss()
    })

    it('When customer has a paying subscription', () => {
        render(
            <BillingInternalViewUI
                {...BillingInternalViewUIDefaultProps}
                billingState={payingWithCreditCard}
            />,
        )

        // Then he should not be able to add a coupon or to extend trial or reactivate trial
        expect(
            screen.queryByRole('button', { name: /Apply coupon/i }),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByRole('button', { name: /Extend trial/i }),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByRole('button', { name: /Reactivate trial/i }),
        ).not.toBeInTheDocument()

        // and the invoice card should say "Next invoice"
        expect(screen.getByText('Next invoice')).toBeInTheDocument()
    })

    it('When customer has a trialing subscription, which has been already extended', () => {
        render(
            <BillingInternalViewUI
                {...BillingInternalViewUIDefaultProps}
                billingState={extendedTrial}
            />,
        )

        // Then he should be able to add a coupon or to extend trial but NOT to reactivate trial
        expect(
            screen.queryByRole('button', { name: /Apply coupon/i }),
        ).toBeInTheDocument()

        expect(
            screen.queryByRole('button', { name: /Extend trial/i }),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByRole('button', { name: /Reactivate trial/i }),
        ).not.toBeInTheDocument()

        // and the invoice card should say "Next invoice"
        expect(screen.getByText('Next invoice')).toBeInTheDocument()
    })

    it('When customer has a trialing subscription, and a coupon has been added', () => {
        render(
            <BillingInternalViewUI
                {...BillingInternalViewUIDefaultProps}
                billingState={trialWithHdAoCoupon}
            />,
        )
        expect(
            screen.queryByRole('button', { name: /Apply coupon/i }),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByRole('button', { name: /Edit coupon/i }),
        ).toBeInTheDocument()

        expect(
            screen.queryByRole('button', { name: /Reactivate trial/i }),
        ).not.toBeInTheDocument()
    })

    it('When trial has ended and has been extended previously + customer hasn’t converted (no active subscription)', () => {
        render(
            <BillingInternalViewUI
                {...BillingInternalViewUIDefaultProps}
                billingState={extendedTrialOverAndUnconverted}
            />,
        )
        expect(
            screen.queryByRole('button', { name: /Apply coupon/i }),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByRole('button', { name: /Edit coupon/i }),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByRole('button', { name: /Extend trial/i }),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByRole('button', { name: /Reactivate trial/i }),
        ).not.toBeInTheDocument()

        expect(screen.queryByText('Next invoice')).toBeInTheDocument()
        expect(screen.queryByText('$0')).toBeInTheDocument()
        expect(
            screen.queryByText(/No active subscription/i),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(/Extended trial ended on/i),
        ).toBeInTheDocument()
    })

    it('should be always possible to deactivate (ban) an account if active', async () => {
        const user = userEvent.setup()
        render(
            <BillingInternalViewUI
                {...BillingInternalViewUIDefaultProps}
                billingState={payingWithCreditCard}
            />,
        )

        const deactivateButton = screen.getByRole('button', {
            name: /Deactivate account/i,
        })

        mockedServer.onPost('/billing/deactivate-account').reply(200, {})
        mockedServer.onGet('/api/account/').reply(200, {
            ...account,
            deactivated_datetime: '2025-01-01T00:00:00Z',
        })
        await act(() => user.click(deactivateButton))

        await waitFor(() => expect(mockedServer.history.post.length).toBe(1))
        expect(mockedServer.history.post[0].url).toBe(
            '/billing/deactivate-account',
        )

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Account has been successfully banned and deactivated.',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should be always possible to reactivate an account if deactivated', async () => {
        const user = userEvent.setup()
        render(
            <BillingInternalViewUI
                {...BillingInternalViewUIDefaultProps}
                billingState={payingWithCreditCard}
            />,
            {
                storeState: {
                    currentAccount: fromJS({
                        ...account,
                        deactivated_datetime: '2025-01-01T00:00:00Z',
                    }),
                } as Partial<RootState>,
            },
        )

        const reactivateButton = screen.getByRole('button', {
            name: /Reactivate account/i,
        })

        mockedServer.onPost('/billing/reactivate-account').reply(200, {})
        mockedServer.onGet('/api/account/').reply(200, account)
        await act(() => user.click(reactivateButton))

        await waitFor(() => expect(mockedServer.history.post.length).toBe(1))
        expect(mockedServer.history.post[0].url).toBe(
            '/billing/reactivate-account',
        )

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Account has been successfully reactivated.',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should be always possible to vet an account', async () => {
        const user = userEvent.setup()
        render(
            <BillingInternalViewUI
                {...BillingInternalViewUIDefaultProps}
                billingState={payingWithCreditCard}
            />,
        )

        const vetButton = screen.getByRole('button', {
            name: /Vet account/,
        })

        mockedServer.onPost('/billing/vet-account').reply(200, {})
        await act(() => user.click(vetButton))

        await waitFor(() => expect(mockedServer.history.post.length).toBe(1))
        expect(mockedServer.history.post[0].url).toBe('/billing/vet-account')

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Account has been successfully (un)vetted.',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    describe('Manage plans button', () => {
        it('is present and enabled for an active account', () => {
            render(
                <BillingInternalViewUI
                    {...BillingInternalViewUIDefaultProps}
                    billingState={payingWithCreditCard}
                />,
            )

            expect(
                screen.getByRole('button', { name: /Manage plans/i }),
            ).toBeEnabled()
        })

        it('navigates to the manage plan path when clicked', async () => {
            const user = userEvent.setup()
            render(
                <BillingInternalViewUI
                    {...BillingInternalViewUIDefaultProps}
                    billingState={payingWithCreditCard}
                />,
            )

            await act(() =>
                user.click(
                    screen.getByRole('button', { name: /Manage plans/i }),
                ),
            )

            expect(mockHistoryPush).toHaveBeenCalledWith(
                BILLING_INTERNAL_MANAGE_PLAN_PATH,
            )
        })
    })

    it('should be always possible to unvet an account', async () => {
        const user = userEvent.setup()
        const vettedAccount: BillingState = {
            ...payingWithCreditCard,
            customer: {
                ...payingWithCreditCard.customer,
                is_vetted: true,
            },
        }

        render(
            <BillingInternalViewUI
                {...BillingInternalViewUIDefaultProps}
                billingState={vettedAccount}
            />,
        )

        const unvetButton = screen.getByRole('button', {
            name: /Unvet account/,
        })

        mockedServer.onPost('/billing/vet-account').reply(200, {})
        await act(() => user.click(unvetButton))

        await waitFor(() => expect(mockedServer.history.post.length).toBe(1))
        expect(mockedServer.history.post[0].url).toBe('/billing/vet-account')

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Account has been successfully (un)vetted.',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })
})
