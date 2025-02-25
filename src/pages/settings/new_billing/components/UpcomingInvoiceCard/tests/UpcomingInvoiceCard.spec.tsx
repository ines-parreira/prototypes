import React from 'react'

import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import user from '@testing-library/user-event'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    CouponSummary,
    ProductType,
    ProductUsages,
    SubscriptionStatus,
    UpcomingInvoiceSummary,
} from 'models/billing/types'
import { useExtendTrialWithSideEffects } from 'pages/settings/new_billing/hooks/useExtendTrialWithSideEffects'
import { useReactivateTrialWithSideEffects } from 'pages/settings/new_billing/hooks/useReactivateTrialWithSideEffects'
import { assumeMock } from 'utils/testing'

import AddSalesCouponModal from '../../AddSalesCouponModal'
import UpcomingInvoiceCard from '../UpcomingInvoiceCard'

jest.mock('../../AddSalesCouponModal/AddSalesCouponModal', () =>
    jest.fn(() => <div data-testid="add-sales-coupon-modal"></div>),
)
const AddSalesCouponModalMock = assumeMock(AddSalesCouponModal)

const endOfCurrentCycleDatetime = '2024-06-25T09:27:00+00:00'
const availableCoupons = [
    'sales-hd+ao-year-05%-once',
    'sales-hd+ao-year-10%-once',
]
const coupon: CouponSummary = {
    name: 'sales-hd+ao-month-15%-12months',
    duration: 'repeating',
    duration_in_months: 12,
    amount_off_in_cents: null,
    amount_off_decimal: null,
    percent_off: 15,
    products: [ProductType.Helpdesk, ProductType.Automation],
}

const usages: ProductUsages = {
    helpdesk: {
        num_tickets: 10,
        num_extra_tickets: 0,
        extra_tickets_cost_in_cents: 0,
    },
    automation: null,
    voice: null,
    sms: null,
    convert: null,
}

const upcomingInvoice: UpcomingInvoiceSummary = {
    coupon: null,
    subtotal_in_cents: 9900,
    subtotal_decimal: '99',
    total_in_cents: 9900,
    total_decimal: '99',
    usages: usages,
}
const upcomingInvoiceWithCouponApplied: UpcomingInvoiceSummary = {
    coupon: coupon,
    subtotal_in_cents: 10000,
    subtotal_decimal: '100',
    total_in_cents: 8500,
    total_decimal: '85',
    usages: usages,
}

const upcomingInvoiceCardParams = {
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    endOfTrialDatetime: null,
    endOfCurrentCycleDatetime: endOfCurrentCycleDatetime,
    availableCoupons: availableCoupons,
    currentHelpdeskAndAutomateCoupon: null,
    upcomingInvoice: upcomingInvoice,
    hasExtendedTrial: false,
}

// Mock the use of const dispatch = useAppDispatch()
jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock
const dispatch = jest.fn()
useAppDispatchMock.mockReturnValue(dispatch)

// Mock tanstack useQueryClient
jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)
const invalidateQueriesMock = jest.fn()
useQueryClientMock.mockImplementation(
    () =>
        ({
            invalidateQueries: invalidateQueriesMock,
        }) as unknown as QueryClient,
)

// Mock useExtendTrialMock
const useExtendTrialMutateMock = jest.fn()
jest.mock('pages/settings/new_billing/hooks/useExtendTrialWithSideEffects')
const useExtendTrialMock = assumeMock(useExtendTrialWithSideEffects)
useExtendTrialMock.mockImplementation(() => {
    return {
        mutate: useExtendTrialMutateMock,
    } as unknown as ReturnType<typeof useExtendTrialWithSideEffects>
})

// Mock useReactivateTrialWithSideEffectsMock
const useReactivateTrialWithSideEffectsMutateMock = jest.fn()
jest.mock('pages/settings/new_billing/hooks/useReactivateTrialWithSideEffects')
const useReactivateTrialWithSideEffectsMock = assumeMock(
    useReactivateTrialWithSideEffects,
)
useReactivateTrialWithSideEffectsMock.mockImplementation(() => {
    const result = {
        mutate: useReactivateTrialWithSideEffectsMutateMock,
        isLoading: false,
    }

    useReactivateTrialWithSideEffectsMutateMock.mockImplementation(() => {
        result.isLoading = true
    })

    result.mutate = useReactivateTrialWithSideEffectsMutateMock

    return result as unknown as ReturnType<typeof useExtendTrialWithSideEffects>
})

describe('UpcomingInvoiceCard', () => {
    it('should show a specific message when there is no upcoming invoice', () => {
        render(
            <UpcomingInvoiceCard
                {...upcomingInvoiceCardParams}
                upcomingInvoice={null}
            />,
        )
        expect(
            screen.getByText('No upcoming invoice for now'),
        ).toBeInTheDocument()
    })

    it('should show the total amount of the upcoming invoice', () => {
        render(<UpcomingInvoiceCard {...upcomingInvoiceCardParams} />)
        expect(screen.getByText('$99')).toBeInTheDocument()
    })

    it('should show "Apply Coupon" button and "Extend trial" button only if in trial', () => {
        render(
            <UpcomingInvoiceCard
                {...upcomingInvoiceCardParams}
                subscriptionStatus={SubscriptionStatus.ACTIVE}
            />,
        )
        expect(
            screen.queryByRole('button', { name: /Apply coupon/i }),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByRole('button', { name: /Extend trial/i }),
        ).not.toBeInTheDocument()

        render(
            <UpcomingInvoiceCard
                {...upcomingInvoiceCardParams}
                subscriptionStatus={SubscriptionStatus.TRIALING}
            />,
        )
        expect(
            screen.getByRole('button', { name: /Apply coupon/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Extend trial/i }),
        ).toBeInTheDocument()
    })

    it('should call the correct endpoint when clicking on Confirm when extending trial', async () => {
        render(
            <UpcomingInvoiceCard
                {...upcomingInvoiceCardParams}
                subscriptionStatus={SubscriptionStatus.TRIALING}
            />,
        )
        user.click(screen.getByRole('button', { name: /Extend trial/i }))
        const confirmButton = await screen.findByRole('button', {
            name: /Confirm/i,
        })
        user.click(confirmButton)

        expect(useExtendTrialMutateMock).toHaveBeenCalledWith([])
    })

    it('should NOT show "Extend trial" button if in trial but trial has already been extended', () => {
        render(
            <UpcomingInvoiceCard
                {...upcomingInvoiceCardParams}
                subscriptionStatus={SubscriptionStatus.TRIALING}
                hasExtendedTrial={true}
            />,
        )
        expect(
            screen.queryByRole('button', { name: /Extend trial/i }),
        ).not.toBeInTheDocument()
    })

    it('should show the Modal when "Apply Coupon" button is clicked', () => {
        render(
            <UpcomingInvoiceCard
                {...upcomingInvoiceCardParams}
                subscriptionStatus={SubscriptionStatus.TRIALING}
            />,
        )
        user.click(screen.getByRole('button', { name: /Apply coupon/i }))

        expect(AddSalesCouponModalMock).toHaveBeenLastCalledWith(
            {
                alreadyAppliedCoupon: undefined,
                availableCoupons: availableCoupons,
                isModalOpen: true,
                onCloseModal: expect.any(Function),
                title: 'Apply Helpdesk and Automate coupon',
            },
            {},
        )
    })

    it('should show coupon name and "Edit Coupon" button if a coupon has been applied', () => {
        render(
            <UpcomingInvoiceCard
                {...upcomingInvoiceCardParams}
                subscriptionStatus={SubscriptionStatus.TRIALING}
                currentHelpdeskAndAutomateCoupon={coupon}
                upcomingInvoice={upcomingInvoiceWithCouponApplied}
            />,
        )
        expect(screen.getByText(coupon.name)).toBeInTheDocument()

        const editCouponButton = screen.getByRole('button', {
            name: /Edit coupon/i,
        })

        expect(editCouponButton).toBeInTheDocument()

        user.click(editCouponButton)

        expect(AddSalesCouponModalMock).toHaveBeenLastCalledWith(
            {
                alreadyAppliedCoupon: coupon.name,
                availableCoupons: availableCoupons,
                isModalOpen: true,
                onCloseModal: expect.any(Function),
                title: 'Apply Helpdesk and Automate coupon',
            },
            {},
        )
    })

    it(`should allow to reactivate trial when the last subscription is cancelled and trial wasn't extended before`, async () => {
        render(
            <UpcomingInvoiceCard
                {...upcomingInvoiceCardParams}
                subscriptionStatus={SubscriptionStatus.CANCELED}
                hasExtendedTrial={false}
            />,
        )

        user.click(screen.getByRole('button', { name: 'Reactivate trial' }))

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: 'Confirm' }),
            ).toBeVisible()
        })

        // Verify that the confirm ation is called only once even if it is clicked multiple times
        user.click(screen.getByRole('button', { name: 'Confirm' }))
        user.click(screen.getByRole('button', { name: 'Confirm' }))
        user.click(screen.getByRole('button', { name: 'Confirm' }))

        await waitFor(() => {
            expect(
                screen.queryByRole('button', { name: 'Confirm' }),
            ).not.toBeInTheDocument()
        })

        expect(
            useReactivateTrialWithSideEffectsMutateMock,
        ).toHaveBeenCalledTimes(1)
    })
})
