import {
    convertPlan1,
    proMonthlyAutomationPlan,
    proMonthlyHelpdeskPlan,
    smsPlan1,
    voicePlan1,
} from 'fixtures/productPrices'
import { CouponSummary, ProductType } from 'models/billing/types'

import { SelectedPlans } from '../../views/BillingProcessView/BillingProcessView'
import { getTotalWithDiscounts } from '../getTotalWithDiscounts'

describe('getTotalWithDiscounts', () => {
    it('should return the base amounts when coupon is null', () => {
        const selectedPlans: SelectedPlans = {
            [ProductType.Helpdesk]: {
                plan: proMonthlyHelpdeskPlan,
                isSelected: true,
            },
            [ProductType.Automation]: {
                plan: proMonthlyAutomationPlan,
                isSelected: true,
            },
            [ProductType.Voice]: {
                plan: voicePlan1,
                isSelected: true,
            },
            [ProductType.SMS]: {
                plan: smsPlan1,
                isSelected: true,
            },
            [ProductType.Convert]: {
                plan: convertPlan1,
                isSelected: true,
            },
        }
        const coupon = null

        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(selectedPlans, coupon)

        expect(totalWithoutDiscounts).toEqual(
            proMonthlyHelpdeskPlan.amount +
                proMonthlyAutomationPlan.amount +
                voicePlan1.amount +
                smsPlan1.amount +
                convertPlan1.amount,
        )
        expect(totalWithDiscounts).toEqual(totalWithoutDiscounts)
        expect(discountAmount).toEqual(0)
    })

    it('should apply coupons to every selected product when `coupon.products` is an empty list', () => {
        const selectedPlans: SelectedPlans = {
            [ProductType.Helpdesk]: {
                plan: proMonthlyHelpdeskPlan,
                isSelected: true,
            },
            [ProductType.Automation]: {
                plan: proMonthlyAutomationPlan,
                isSelected: true,
            },
            [ProductType.Voice]: {
                plan: voicePlan1,
                isSelected: true,
            },
            [ProductType.SMS]: {
                plan: smsPlan1,
                isSelected: true,
            },
            [ProductType.Convert]: {
                plan: convertPlan1,
                isSelected: true,
            },
        }
        const coupon: CouponSummary = {
            name: 'test coupon - %50 off, every product',
            duration: 'forever',
            duration_in_months: null,
            amount_off_in_cents: null,
            amount_off_decimal: null,
            percent_off: 50,
            products: [],
        }

        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(selectedPlans, coupon)

        const expectedDiscountAmount = totalWithoutDiscounts / 2

        expect(totalWithoutDiscounts).toEqual(
            proMonthlyHelpdeskPlan.amount +
                proMonthlyAutomationPlan.amount +
                voicePlan1.amount +
                smsPlan1.amount +
                convertPlan1.amount,
        )
        expect(totalWithDiscounts).toEqual(
            totalWithoutDiscounts - expectedDiscountAmount,
        )
        expect(discountAmount).toEqual(expectedDiscountAmount)
    })

    it('should only include selected plans in the calculations', () => {
        const selectedPlans: SelectedPlans = {
            [ProductType.Helpdesk]: {
                plan: proMonthlyHelpdeskPlan,
                isSelected: true,
            },
            [ProductType.Automation]: {
                plan: proMonthlyAutomationPlan,
                isSelected: true,
            },
            [ProductType.Voice]: {
                plan: voicePlan1,
                isSelected: false,
            },
            [ProductType.SMS]: {
                plan: smsPlan1,
                isSelected: false,
            },
            [ProductType.Convert]: {
                plan: convertPlan1,
                isSelected: false,
            },
        }
        // coupon applies to all products, but only helpdesk and automation are selected currently
        const coupon: CouponSummary = {
            name: 'test coupon - 50% off',
            duration: 'forever',
            duration_in_months: null,
            amount_off_in_cents: null,
            amount_off_decimal: null,
            percent_off: 50,
            products: [],
        }

        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(selectedPlans, coupon)

        const expectedDiscountAmount =
            proMonthlyHelpdeskPlan.amount / 2 +
            proMonthlyAutomationPlan.amount / 2

        expect(totalWithoutDiscounts).toEqual(
            proMonthlyHelpdeskPlan.amount + proMonthlyAutomationPlan.amount,
        )
        expect(totalWithDiscounts).toEqual(
            totalWithoutDiscounts - expectedDiscountAmount,
        )
        expect(discountAmount).toEqual(expectedDiscountAmount)
    })

    it('should only apply coupons to whitelisted products from `coupon.products`', () => {
        const selectedPlans: SelectedPlans = {
            [ProductType.Helpdesk]: {
                plan: proMonthlyHelpdeskPlan,
                isSelected: true,
            },
            [ProductType.Automation]: {
                plan: proMonthlyAutomationPlan,
                isSelected: true,
            },
            [ProductType.Voice]: {
                plan: voicePlan1,
                isSelected: true,
            },
            [ProductType.SMS]: {
                plan: smsPlan1,
                isSelected: true,
            },
            [ProductType.Convert]: {
                plan: convertPlan1,
                isSelected: true,
            },
        }
        const coupon: CouponSummary = {
            name: 'test coupon - %50 off, helpdesk only',
            duration: 'forever',
            duration_in_months: null,
            amount_off_in_cents: null,
            amount_off_decimal: null,
            percent_off: 50,
            products: [ProductType.Helpdesk],
        }

        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(selectedPlans, coupon)

        const expectedDiscountAmount = proMonthlyHelpdeskPlan.amount / 2

        expect(totalWithoutDiscounts).toEqual(
            proMonthlyHelpdeskPlan.amount +
                proMonthlyAutomationPlan.amount +
                voicePlan1.amount +
                smsPlan1.amount +
                convertPlan1.amount,
        )
        expect(totalWithDiscounts).toEqual(
            totalWithoutDiscounts - expectedDiscountAmount,
        )
        expect(discountAmount).toEqual(expectedDiscountAmount)
    })

    it('should not apply a discount larger than the product amount', () => {
        const selectedPlans: SelectedPlans = {
            [ProductType.Helpdesk]: {
                plan: proMonthlyHelpdeskPlan,
                isSelected: true,
            },
            [ProductType.Automation]: {
                plan: proMonthlyAutomationPlan,
                isSelected: false,
            },
            [ProductType.Voice]: {
                plan: voicePlan1,
                isSelected: false,
            },
            [ProductType.SMS]: {
                plan: smsPlan1,
                isSelected: false,
            },
            [ProductType.Convert]: {
                plan: convertPlan1,
                isSelected: false,
            },
        }
        const coupon: CouponSummary = {
            name: 'test coupon - $20k off',
            duration: 'forever',
            duration_in_months: null,
            amount_off_in_cents: 20000000,
            amount_off_decimal: '20000',
            percent_off: null,
            products: [ProductType.Helpdesk],
        }

        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(selectedPlans, coupon)

        const expectedDiscountAmount = proMonthlyHelpdeskPlan.amount

        expect(totalWithoutDiscounts).toEqual(proMonthlyHelpdeskPlan.amount)
        expect(totalWithDiscounts).toEqual(
            totalWithoutDiscounts - expectedDiscountAmount,
        )
        expect(totalWithDiscounts).toEqual(0)
        expect(discountAmount).toEqual(expectedDiscountAmount)
    })

    it('should share flat amount discount across several eligible products', () => {
        const selectedPlans: SelectedPlans = {
            [ProductType.Helpdesk]: {
                plan: proMonthlyHelpdeskPlan,
                isSelected: true,
            },
            [ProductType.Automation]: {
                plan: proMonthlyAutomationPlan,
                isSelected: true,
            },
            [ProductType.Voice]: {
                plan: voicePlan1,
                isSelected: false,
            },
            [ProductType.SMS]: {
                plan: smsPlan1,
                isSelected: false,
            },
            [ProductType.Convert]: {
                plan: convertPlan1,
                isSelected: false,
            },
        }
        const coupon: CouponSummary = {
            name: 'test coupon - $200 off',
            duration: 'forever',
            duration_in_months: null,
            amount_off_in_cents: 20000,
            amount_off_decimal: '200',
            percent_off: null,
            products: [ProductType.Helpdesk, ProductType.Automation],
        }

        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(selectedPlans, coupon)

        const expectedDiscountAmount = 20000

        expect(totalWithoutDiscounts).toEqual(
            proMonthlyHelpdeskPlan.amount + proMonthlyAutomationPlan.amount,
        )
        expect(totalWithDiscounts).toEqual(
            totalWithoutDiscounts - (coupon.amount_off_in_cents as number),
        )
        expect(discountAmount).toEqual(expectedDiscountAmount)
    })
})
