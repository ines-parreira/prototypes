import type { SelectedPlans } from '@repo/billing'

import {
    convertPlan1,
    proMonthlyAutomationPlan,
    proMonthlyHelpdeskPlan,
    smsPlan1,
    voicePlan1,
} from 'fixtures/plans'
import type { CouponSummary } from 'models/billing/types'
import { ProductType } from 'models/billing/types'

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

    describe('with totalCancelledAmount', () => {
        it('should subtract totalCancelledAmount from totals when no coupon is applied', () => {
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
            const coupon = null
            const totalCancelledAmount = 5000

            const {
                totalWithDiscounts,
                totalWithoutDiscounts,
                discountAmount,
            } = getTotalWithDiscounts(
                selectedPlans,
                coupon,
                totalCancelledAmount,
            )

            const expectedTotal =
                proMonthlyHelpdeskPlan.amount +
                proMonthlyAutomationPlan.amount -
                totalCancelledAmount

            expect(totalWithoutDiscounts).toEqual(expectedTotal)
            expect(totalWithDiscounts).toEqual(expectedTotal)
            expect(discountAmount).toEqual(0)
        })

        it('should apply percentage discount to amount after subtracting cancellations', () => {
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
                name: 'test coupon - 50% off',
                duration: 'forever',
                duration_in_months: null,
                amount_off_in_cents: null,
                amount_off_decimal: null,
                percent_off: 50,
                products: [],
            }
            const totalCancelledAmount = 3000

            const {
                totalWithDiscounts,
                totalWithoutDiscounts,
                discountAmount,
            } = getTotalWithDiscounts(
                selectedPlans,
                coupon,
                totalCancelledAmount,
            )

            const totalBeforeCancellation =
                proMonthlyHelpdeskPlan.amount + proMonthlyAutomationPlan.amount
            const totalAfterCancellation =
                totalBeforeCancellation - totalCancelledAmount
            const expectedDiscount = totalAfterCancellation * 0.5

            expect(totalWithoutDiscounts).toEqual(totalAfterCancellation)
            expect(discountAmount).toEqual(expectedDiscount)
            expect(totalWithDiscounts).toEqual(
                totalAfterCancellation - expectedDiscount,
            )
        })

        it('should apply fixed amount discount after subtracting cancellations', () => {
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
                name: 'test coupon - $20 off',
                duration: 'forever',
                duration_in_months: null,
                amount_off_in_cents: 2000,
                amount_off_decimal: '20',
                percent_off: null,
                products: [],
            }
            const totalCancelledAmount = 1000

            const {
                totalWithDiscounts,
                totalWithoutDiscounts,
                discountAmount,
            } = getTotalWithDiscounts(
                selectedPlans,
                coupon,
                totalCancelledAmount,
            )

            const totalBeforeCancellation =
                proMonthlyHelpdeskPlan.amount + proMonthlyAutomationPlan.amount
            const totalAfterCancellation =
                totalBeforeCancellation - totalCancelledAmount

            expect(totalWithoutDiscounts).toEqual(totalAfterCancellation)
            expect(discountAmount).toEqual(2000)
            expect(totalWithDiscounts).toEqual(totalAfterCancellation - 2000)
        })
    })

    describe('with cancelledProducts', () => {
        it('should exclude cancelled products from discount calculation when coupon applies to all products', () => {
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
                    isSelected: false,
                },
                [ProductType.Convert]: {
                    plan: convertPlan1,
                    isSelected: false,
                },
            }
            const coupon: CouponSummary = {
                name: 'test coupon - 50% off all',
                duration: 'forever',
                duration_in_months: null,
                amount_off_in_cents: null,
                amount_off_decimal: null,
                percent_off: 50,
                products: [],
            }
            const totalCancelledAmount = voicePlan1.amount
            const cancelledProducts = [ProductType.Voice]

            const {
                totalWithDiscounts,
                totalWithoutDiscounts,
                discountAmount,
            } = getTotalWithDiscounts(
                selectedPlans,
                coupon,
                totalCancelledAmount,
                cancelledProducts,
            )

            const totalBeforeCancellation =
                proMonthlyHelpdeskPlan.amount +
                proMonthlyAutomationPlan.amount +
                voicePlan1.amount
            const totalAfterCancellation =
                totalBeforeCancellation - totalCancelledAmount
            const expectedDiscount = totalAfterCancellation * 0.5

            expect(totalWithoutDiscounts).toEqual(totalAfterCancellation)
            expect(discountAmount).toEqual(expectedDiscount)
            expect(totalWithDiscounts).toEqual(
                totalAfterCancellation - expectedDiscount,
            )
        })

        it('should exclude cancelled products from discount when coupon applies to specific products including cancelled one', () => {
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
                    isSelected: false,
                },
                [ProductType.Convert]: {
                    plan: convertPlan1,
                    isSelected: false,
                },
            }
            const coupon: CouponSummary = {
                name: 'test coupon - 50% off helpdesk and automation',
                duration: 'forever',
                duration_in_months: null,
                amount_off_in_cents: null,
                amount_off_decimal: null,
                percent_off: 50,
                products: [ProductType.Helpdesk, ProductType.Automation],
            }
            const totalCancelledAmount = proMonthlyAutomationPlan.amount
            const cancelledProducts = [ProductType.Automation]

            const {
                totalWithDiscounts,
                totalWithoutDiscounts,
                discountAmount,
            } = getTotalWithDiscounts(
                selectedPlans,
                coupon,
                totalCancelledAmount,
                cancelledProducts,
            )

            const totalBeforeCancellation =
                proMonthlyHelpdeskPlan.amount +
                proMonthlyAutomationPlan.amount +
                voicePlan1.amount
            const totalAfterCancellation =
                totalBeforeCancellation - totalCancelledAmount
            // Discount should only apply to helpdesk (automation is cancelled)
            const expectedDiscount = proMonthlyHelpdeskPlan.amount * 0.5

            expect(totalWithoutDiscounts).toEqual(totalAfterCancellation)
            expect(discountAmount).toEqual(expectedDiscount)
            expect(totalWithDiscounts).toEqual(
                totalAfterCancellation - expectedDiscount,
            )
        })

        it('should not apply discount to cancelled products when coupon is product-specific', () => {
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
                name: 'test coupon - 50% off helpdesk only',
                duration: 'forever',
                duration_in_months: null,
                amount_off_in_cents: null,
                amount_off_decimal: null,
                percent_off: 50,
                products: [ProductType.Helpdesk],
            }
            const totalCancelledAmount = proMonthlyHelpdeskPlan.amount
            const cancelledProducts = [ProductType.Helpdesk]

            const {
                totalWithDiscounts,
                totalWithoutDiscounts,
                discountAmount,
            } = getTotalWithDiscounts(
                selectedPlans,
                coupon,
                totalCancelledAmount,
                cancelledProducts,
            )

            const totalBeforeCancellation =
                proMonthlyHelpdeskPlan.amount + proMonthlyAutomationPlan.amount
            const totalAfterCancellation =
                totalBeforeCancellation - totalCancelledAmount
            // No discount should be applied since helpdesk (the only eligible product) is cancelled
            const expectedDiscount = 0

            expect(totalWithoutDiscounts).toEqual(totalAfterCancellation)
            expect(discountAmount).toEqual(expectedDiscount)
            expect(totalWithDiscounts).toEqual(totalAfterCancellation)
        })

        it('should handle multiple cancelled products correctly', () => {
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
                    isSelected: false,
                },
            }
            const coupon: CouponSummary = {
                name: 'test coupon - 25% off all',
                duration: 'forever',
                duration_in_months: null,
                amount_off_in_cents: null,
                amount_off_decimal: null,
                percent_off: 25,
                products: [],
            }
            const totalCancelledAmount =
                proMonthlyAutomationPlan.amount + voicePlan1.amount
            const cancelledProducts = [
                ProductType.Automation,
                ProductType.Voice,
            ]

            const {
                totalWithDiscounts,
                totalWithoutDiscounts,
                discountAmount,
            } = getTotalWithDiscounts(
                selectedPlans,
                coupon,
                totalCancelledAmount,
                cancelledProducts,
            )

            const totalBeforeCancellation =
                proMonthlyHelpdeskPlan.amount +
                proMonthlyAutomationPlan.amount +
                voicePlan1.amount +
                smsPlan1.amount
            const totalAfterCancellation =
                totalBeforeCancellation - totalCancelledAmount
            const expectedDiscount = totalAfterCancellation * 0.25

            expect(totalWithoutDiscounts).toEqual(totalAfterCancellation)
            expect(discountAmount).toEqual(expectedDiscount)
            expect(totalWithDiscounts).toEqual(
                totalAfterCancellation - expectedDiscount,
            )
        })
    })
})
