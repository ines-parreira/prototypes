import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'

import {advancedMonthlyHelpdeskPlan} from 'fixtures/productPrices'
import {CouponSummary, ProductType} from 'models/billing/types'
import {getPlanDescription} from 'models/billing/utils'
import {assumeMock} from 'utils/testing'

import AddSalesCouponModal from '../../AddSalesCouponModal'
import ProductCardForCoupon from '../ProductCardForCoupon'

const endOfTrialDatetime = '2024-06-25T09:27:00+00:00'
const availableCoupons = ['sales-hd-year-05%-once', 'sales-hd-year-10%-once']
jest.mock('../../AddSalesCouponModal/AddSalesCouponModal', () =>
    jest.fn(() => <div data-testid="add-sales-coupon-modal"></div>)
)
const AddSalesCouponModalMock = assumeMock(AddSalesCouponModal)

describe('ProductCardForCoupon', () => {
    it('should show the plan description', () => {
        render(
            <ProductCardForCoupon
                productName="Helpdesk"
                isTrialing={true}
                endOfTrialDatetime={endOfTrialDatetime}
                currentCoupon={null}
                plan={advancedMonthlyHelpdeskPlan}
                canApplyProductCoupon={false}
                availableCoupons={availableCoupons}
            />
        )
        expect(
            screen.getByText(getPlanDescription(advancedMonthlyHelpdeskPlan))
        ).toBeInTheDocument()
    })

    it('should show trial ending date if in trial', () => {
        render(
            <ProductCardForCoupon
                productName="Helpdesk"
                isTrialing={true}
                endOfTrialDatetime={endOfTrialDatetime}
                currentCoupon={null}
                plan={advancedMonthlyHelpdeskPlan}
                canApplyProductCoupon={false}
                availableCoupons={availableCoupons}
            />
        )
        expect(screen.getByText('Free trial ends on')).toBeInTheDocument()
        expect(screen.getByText('June 25, 2024')).toBeInTheDocument()
    })

    it('should show "Apply Coupon" button if canApplyProductCoupon is true', () => {
        render(
            <ProductCardForCoupon
                productName={'Helpdesk'}
                isTrialing={true}
                endOfTrialDatetime={endOfTrialDatetime}
                currentCoupon={null}
                plan={advancedMonthlyHelpdeskPlan}
                canApplyProductCoupon={true}
                availableCoupons={availableCoupons}
            />
        )
        expect(
            screen.getByRole('button', {name: /Apply Helpdesk coupon/i})
        ).toBeInTheDocument()
    })

    it('should show the Modal when "Apply Coupon" button is clicked', () => {
        render(
            <ProductCardForCoupon
                productName={'Helpdesk'}
                isTrialing={true}
                endOfTrialDatetime={endOfTrialDatetime}
                currentCoupon={null}
                plan={advancedMonthlyHelpdeskPlan}
                canApplyProductCoupon={true}
                availableCoupons={availableCoupons}
            />
        )
        fireEvent.click(
            screen.getByRole('button', {name: /Apply Helpdesk coupon/i})
        )

        expect(AddSalesCouponModalMock).toHaveBeenLastCalledWith(
            {
                alreadyAppliedCoupon: undefined,
                availableCoupons: availableCoupons,
                isModalOpen: true,
                onCloseModal: expect.any(Function),
                title: 'Apply Helpdesk coupon',
            },
            {}
        )
    })

    it('should NOT show Apply Coupon button if canApplyProductCoupon is false', () => {
        render(
            <ProductCardForCoupon
                productName={'Helpdesk'}
                isTrialing={true}
                endOfTrialDatetime={endOfTrialDatetime}
                currentCoupon={null}
                plan={advancedMonthlyHelpdeskPlan}
                canApplyProductCoupon={false}
                availableCoupons={availableCoupons}
            />
        )
        expect(
            screen.queryByRole('button', {name: /Apply Helpdesk coupon/i})
        ).not.toBeInTheDocument()
    })

    it('should show coupon name and "Edit Coupon" button if a coupon has been applied', () => {
        const coupon: CouponSummary = {
            name: 'sales-hd-month-15%-12months',
            duration: 'repeating',
            duration_in_months: 12,
            amount_off_in_cents: null,
            amount_off_decimal: null,
            percent_off: 15,
            products: [ProductType.Helpdesk],
        }
        render(
            <ProductCardForCoupon
                productName={'Helpdesk'}
                isTrialing={true}
                endOfTrialDatetime={endOfTrialDatetime}
                currentCoupon={coupon}
                plan={advancedMonthlyHelpdeskPlan}
                canApplyProductCoupon={false}
                availableCoupons={availableCoupons}
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
                title: 'Apply Helpdesk coupon',
            },
            {}
        )
    })
})
