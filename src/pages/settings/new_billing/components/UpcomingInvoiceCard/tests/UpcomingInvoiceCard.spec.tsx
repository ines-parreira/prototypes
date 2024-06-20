import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {
    CouponSummary,
    ProductUsages,
    UpcomingInvoiceSummary,
} from 'models/billing/types'
import {assumeMock} from 'utils/testing'
import AddSalesCouponModal from '../../AddSalesCouponModal'
import UpcomingInvoiceCard from '../UpcomingInvoiceCard'

jest.mock('../../AddSalesCouponModal/AddSalesCouponModal', () =>
    jest.fn(() => <div data-testid="add-sales-coupon-modal"></div>)
)
const AddSalesCouponModalMock = assumeMock(AddSalesCouponModal)

const endOfCurrentCycleDatetime = '2024-06-25T09:27:00+00:00'
const endOfTrialDatetime = '2024-06-25T09:27:00+00:00'
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
describe('UpcomingInvoiceCard', () => {
    it('should show a specific message when there is no upcoming invoice', () => {
        render(
            <UpcomingInvoiceCard
                isTrialing={false}
                endOfTrialDatetime={null}
                endOfCurrentCycleDatetime={endOfCurrentCycleDatetime}
                availableCoupons={availableCoupons}
                currentHelpdeskAndAutomateCoupon={null}
                upcomingInvoice={null}
            />
        )
        expect(
            screen.getByText('No upcoming invoice for now')
        ).toBeInTheDocument()
    })
    it('should show the total amount of the upcoming invoice', () => {
        render(
            <UpcomingInvoiceCard
                isTrialing={false}
                endOfTrialDatetime={null}
                endOfCurrentCycleDatetime={endOfCurrentCycleDatetime}
                availableCoupons={availableCoupons}
                currentHelpdeskAndAutomateCoupon={null}
                upcomingInvoice={upcomingInvoice}
            />
        )
        expect(screen.getByText('$99')).toBeInTheDocument()
    })

    it('should show "Apply Coupon" button if canApplyProductCoupon is true', () => {
        render(
            <UpcomingInvoiceCard
                isTrialing={true}
                endOfTrialDatetime={endOfTrialDatetime}
                endOfCurrentCycleDatetime={endOfCurrentCycleDatetime}
                availableCoupons={availableCoupons}
                currentHelpdeskAndAutomateCoupon={null}
                upcomingInvoice={upcomingInvoice}
            />
        )
        expect(
            screen.getByRole('button', {name: /Apply coupon/i})
        ).toBeInTheDocument()
    })

    it('should NOT show "Apply Coupon" button if canApplyProductCoupon is true', () => {
        render(
            <UpcomingInvoiceCard
                isTrialing={false}
                endOfTrialDatetime={endOfTrialDatetime}
                endOfCurrentCycleDatetime={endOfCurrentCycleDatetime}
                availableCoupons={availableCoupons}
                currentHelpdeskAndAutomateCoupon={null}
                upcomingInvoice={upcomingInvoice}
            />
        )
        expect(
            screen.queryByRole('button', {name: /Apply coupon/i})
        ).not.toBeInTheDocument()
    })

    it('should show the Modal when "Apply Coupon" button is clicked', () => {
        render(
            <UpcomingInvoiceCard
                isTrialing={true}
                endOfTrialDatetime={endOfTrialDatetime}
                endOfCurrentCycleDatetime={endOfCurrentCycleDatetime}
                availableCoupons={availableCoupons}
                currentHelpdeskAndAutomateCoupon={null}
                upcomingInvoice={upcomingInvoice}
            />
        )
        fireEvent.click(screen.getByRole('button', {name: /Apply coupon/i}))

        expect(AddSalesCouponModalMock).toHaveBeenLastCalledWith(
            {
                alreadyAppliedCoupon: undefined,
                availableCoupons: availableCoupons,
                isModalOpen: true,
                onCloseModal: expect.any(Function),
                title: 'Apply Helpdesk and Automate coupon',
            },
            {}
        )
    })

    it('should show coupon name and "Edit Coupon" button if a coupon has been applied', () => {
        render(
            <UpcomingInvoiceCard
                isTrialing={true}
                endOfTrialDatetime={endOfTrialDatetime}
                endOfCurrentCycleDatetime={endOfCurrentCycleDatetime}
                availableCoupons={availableCoupons}
                currentHelpdeskAndAutomateCoupon={coupon}
                upcomingInvoice={upcomingInvoiceWithCouponApplied}
            />
        )
        expect(screen.getByText(coupon.name)).toBeInTheDocument()

        const editCouponButton = screen.getByRole('button', {
            name: /Edit coupon/i,
        })

        expect(editCouponButton).toBeInTheDocument()

        fireEvent.click(editCouponButton)

        expect(AddSalesCouponModalMock).toHaveBeenLastCalledWith(
            {
                alreadyAppliedCoupon: coupon.name,
                availableCoupons: availableCoupons,
                isModalOpen: true,
                onCloseModal: expect.any(Function),
                title: 'Apply Helpdesk and Automate coupon',
            },
            {}
        )
    })
})
