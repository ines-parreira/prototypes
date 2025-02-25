import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import user from '@testing-library/user-event'
import MockDate from 'mockdate'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    CouponSummary,
    ProductType,
    SubscriptionStatus,
    UpcomingInvoiceSummary,
} from 'models/billing/types'
import { BillingInternalViewUI } from 'pages/settings/new_billing/components/BillingInternalViewUI/BillingInternalViewUI'
import {
    payingWithCreditCard,
    trial,
    usages,
} from 'pages/settings/new_billing/fixtures'
import { useExtendTrialWithSideEffects } from 'pages/settings/new_billing/hooks/useExtendTrialWithSideEffects'
import { useReactivateTrialWithSideEffects } from 'pages/settings/new_billing/hooks/useReactivateTrialWithSideEffects'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

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

const trialOverAndUnconverted = {
    ...trial,
    subscription: {
        ...trial.subscription,
        status: SubscriptionStatus.CANCELED,
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

const queryClient = mockQueryClient()

// Mock useExtendTrialMock
const useExtendTrialMutateMock = jest.fn()
jest.mock('pages/settings/new_billing/hooks/useExtendTrialWithSideEffects')
const useExtendTrialMock = assumeMock(useExtendTrialWithSideEffects)
useExtendTrialMock.mockImplementation(() => {
    return {
        mutate: useExtendTrialMutateMock,
    } as unknown as ReturnType<typeof useExtendTrialWithSideEffects>
})

// Mock useReactivateTrialMock
const useReactivateTrialMutateMock = jest.fn()
jest.mock('pages/settings/new_billing/hooks/useReactivateTrialWithSideEffects')
const useReactivateTrialMock = assumeMock(useReactivateTrialWithSideEffects)
useReactivateTrialMock.mockImplementation(() => {
    return {
        mutate: useReactivateTrialMutateMock,
    } as unknown as ReturnType<typeof useReactivateTrialWithSideEffects>
})

describe('BillingInternalViewUI', () => {
    it('When customer has a paying subscription', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <BillingInternalViewUI
                    {...BillingInternalViewUIDefaultProps}
                    billingState={payingWithCreditCard}
                />
            </QueryClientProvider>,
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

    it('When customer has a trialing subscription, which has NOT been extended', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <BillingInternalViewUI
                    {...BillingInternalViewUIDefaultProps}
                    billingState={trial}
                />
            </QueryClientProvider>,
        )

        // Then he should be able to add a coupon or to extend trial but NOT to reactivate trial
        expect(
            screen.queryByRole('button', { name: /Apply coupon/i }),
        ).toBeInTheDocument()

        expect(
            screen.queryByRole('button', { name: /Extend trial/i }),
        ).toBeInTheDocument()

        expect(
            screen.queryByRole('button', { name: /Reactivate trial/i }),
        ).not.toBeInTheDocument()

        // and the invoice card should say "Next invoice"
        expect(screen.getByText('Next invoice')).toBeInTheDocument()

        // When clicking on 'Extend trial' button
        user.click(screen.getByRole('button', { name: /Extend trial/i }))
        const confirmButton = await screen.findByRole('button', {
            name: /Confirm/i,
        })
        user.click(confirmButton)

        expect(useExtendTrialMutateMock).toHaveBeenCalledWith([])

        // When clicking on 'Apply coupon' button
        user.click(screen.getByRole('button', { name: /Apply coupon/i }))

        // Then a modal should show up
        const modal = screen.getByRole('dialog')
        expect(
            within(modal).getByText(/Apply Helpdesk and Automate coupon/i),
        ).toBeInTheDocument()

        // with a dropdown having the list of available coupons
        const items = document.getElementsByClassName('dropdown-item')
        expect(items[0]).toHaveTextContent(availableHdAoCoupons[0])
        expect(items[1]).toHaveTextContent(availableHdAoCoupons[1])

        // with 'Cancel' and 'Apply Coupon' buttons

        expect(
            within(modal).queryByRole('button', { name: 'Delete Coupon' }),
        ).not.toBeInTheDocument()
        within(modal).getByRole('button', { name: 'Cancel' })
        within(modal).getByRole('button', { name: 'Apply Coupon' })
    })

    it('When customer has a trialing subscription, which has been already extended', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <BillingInternalViewUI
                    {...BillingInternalViewUIDefaultProps}
                    billingState={extendedTrial}
                />
            </QueryClientProvider>,
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
            <QueryClientProvider client={queryClient}>
                <BillingInternalViewUI
                    {...BillingInternalViewUIDefaultProps}
                    billingState={trialWithHdAoCoupon}
                />
            </QueryClientProvider>,
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

    it('When trial has ended and has NOT been extended previously + customer hasn’t converted (no active subscription)', async () => {
        MockDate.set('2050-08-10T00:00:00.000Z')

        render(
            <QueryClientProvider client={queryClient}>
                <BillingInternalViewUI
                    {...BillingInternalViewUIDefaultProps}
                    billingState={trialOverAndUnconverted}
                />
            </QueryClientProvider>,
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
        ).toBeInTheDocument()

        expect(screen.queryByText('Next invoice')).toBeInTheDocument()
        expect(screen.queryByText('$0')).toBeInTheDocument()
        expect(
            screen.queryByText(/No active subscription/i),
        ).toBeInTheDocument()
        expect(screen.queryByText(/Trial ended on/i)).toBeInTheDocument()

        // When clicking on 'Reactivate trial' button
        user.click(screen.getByRole('button', { name: /Reactivate trial/i }))

        // Then
        expect(
            screen.getByText(/Do you want to reactivate trial until/i),
        ).toBeInTheDocument()
        expect(screen.getByText(/August 17, 2050/i)).toBeInTheDocument()
        expect(
            screen.getByText(
                /Note, that once confirmed, the reactivation cannot be undone./i,
            ),
        ).toBeInTheDocument()

        expect(useReactivateTrialMutateMock).not.toHaveBeenCalledWith([])

        const confirmButton = await screen.findByRole('button', {
            name: /Confirm/i,
        })
        user.click(confirmButton)

        expect(useReactivateTrialMutateMock).toHaveBeenCalledWith([])
    })

    it('When trial has ended and has been extended previously + customer hasn’t converted (no active subscription)', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <BillingInternalViewUI
                    {...BillingInternalViewUIDefaultProps}
                    billingState={extendedTrialOverAndUnconverted}
                />
            </QueryClientProvider>,
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
})
