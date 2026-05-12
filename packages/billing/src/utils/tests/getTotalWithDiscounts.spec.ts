import {
    DiscountApplicability,
    DiscountObjectType,
    InvoiceCadence,
} from '@gorgias/helpdesk-types'
import type { DiscountReductionType, DiscountVO } from '@gorgias/helpdesk-types'

import { Cadence, HelpdeskPlanTier, ProductType } from '../../types'
import type {
    AutomatePlan,
    ConvertPlan,
    HelpdeskPlan,
    SelectedPlans,
    SMSOrVoicePlan,
} from '../../types'
import { getTotalWithDiscounts } from '../getTotalWithDiscounts'

const DiscountTypeFlat = 1 as DiscountReductionType
const DiscountTypePercentage = 2 as DiscountReductionType

const proMonthlyHelpdeskPlan: HelpdeskPlan = {
    product: ProductType.Helpdesk,
    num_quota_tickets: 100,
    amount: 10000,
    currency: 'usd',
    custom: false,
    extra_ticket_cost: 0,
    plan_id: 'helpdesk-pro-monthly',
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    name: 'Pro',
    public: true,
    integrations: 1,
    is_legacy: false,
    features: {} as never,
    tier: HelpdeskPlanTier.PRO,
}

const proMonthlyAutomationPlan: AutomatePlan = {
    product: ProductType.Automation,
    num_quota_tickets: 50,
    amount: 5000,
    currency: 'usd',
    custom: false,
    extra_ticket_cost: 0,
    plan_id: 'automation-pro-monthly',
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    name: 'Pro',
    public: true,
    features: {} as never,
}

const voicePlan: SMSOrVoicePlan = {
    product: ProductType.Voice,
    num_quota_tickets: 10,
    amount: 2000,
    currency: 'usd',
    custom: false,
    extra_ticket_cost: 0,
    plan_id: 'voice-monthly',
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    name: 'Voice',
    public: true,
}

const smsPlan: SMSOrVoicePlan = {
    ...voicePlan,
    product: ProductType.SMS,
    plan_id: 'sms-monthly',
    name: 'SMS',
}

const convertPlan: ConvertPlan = {
    product: ProductType.Convert,
    num_quota_tickets: 25,
    amount: 3000,
    currency: 'usd',
    custom: false,
    extra_ticket_cost: 0,
    plan_id: 'convert-monthly',
    cadence: Cadence.Month,
    invoice_cadence: InvoiceCadence.Month,
    name: 'Convert',
    public: true,
    tier: 1,
}

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
        plan: voicePlan,
        isSelected: true,
    },
    [ProductType.SMS]: {
        plan: smsPlan,
        isSelected: true,
    },
    [ProductType.Convert]: {
        plan: convertPlan,
        isSelected: true,
    },
}

const baseDiscount: Pick<
    DiscountVO,
    'discount_applicability' | 'discount_type' | 'discount_object_type'
> = {
    discount_applicability: DiscountApplicability[1],
    discount_type: DiscountTypePercentage,
    discount_object_type: DiscountObjectType[1],
}

describe('getTotalWithDiscounts', () => {
    it('returns the base amounts when discounts is empty', () => {
        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(selectedPlans, [])

        const total =
            proMonthlyHelpdeskPlan.amount +
            proMonthlyAutomationPlan.amount +
            voicePlan.amount +
            smsPlan.amount +
            convertPlan.amount

        expect(totalWithoutDiscounts).toBe(total)
        expect(totalWithDiscounts).toBe(total)
        expect(discountAmount).toBe(0)
    })

    it('applies percent discounts to every selected product when discount products is empty', () => {
        const discount: DiscountVO = {
            ...baseDiscount,
            amount_off_in_cents: null,
            percent_off: 50,
            products: [],
        }

        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(selectedPlans, [discount])

        expect(discountAmount).toBe(totalWithoutDiscounts / 2)
        expect(totalWithDiscounts).toBe(totalWithoutDiscounts / 2)
    })

    it('only discounts whitelisted products', () => {
        const discount: DiscountVO = {
            ...baseDiscount,
            amount_off_in_cents: null,
            percent_off: 50,
            products: [ProductType.Helpdesk],
        }

        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(selectedPlans, [discount])

        expect(discountAmount).toBe(proMonthlyHelpdeskPlan.amount / 2)
        expect(totalWithDiscounts).toBe(
            totalWithoutDiscounts - proMonthlyHelpdeskPlan.amount / 2,
        )
    })

    it('caps flat discounts at the eligible amount', () => {
        const discount: DiscountVO = {
            ...baseDiscount,
            discount_type: DiscountTypeFlat,
            amount_off_in_cents: 20000000,
            percent_off: null,
            products: [ProductType.Helpdesk],
        }

        const singleProductSelection: SelectedPlans = {
            ...selectedPlans,
            [ProductType.Automation]: {
                plan: proMonthlyAutomationPlan,
                isSelected: false,
            },
            [ProductType.Voice]: {
                plan: voicePlan,
                isSelected: false,
            },
            [ProductType.SMS]: {
                plan: smsPlan,
                isSelected: false,
            },
            [ProductType.Convert]: {
                plan: convertPlan,
                isSelected: false,
            },
        }

        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(singleProductSelection, [discount])

        expect(totalWithoutDiscounts).toBe(proMonthlyHelpdeskPlan.amount)
        expect(discountAmount).toBe(proMonthlyHelpdeskPlan.amount)
        expect(totalWithDiscounts).toBe(0)
    })

    it('subtracts cancellations before applying a percentage discount', () => {
        const discount: DiscountVO = {
            ...baseDiscount,
            amount_off_in_cents: null,
            percent_off: 50,
            products: [],
        }

        const totalCancelledAmount = convertPlan.amount
        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(
                selectedPlans,
                [discount],
                totalCancelledAmount,
                [ProductType.Convert],
            )

        const totalBeforeCancellation =
            proMonthlyHelpdeskPlan.amount +
            proMonthlyAutomationPlan.amount +
            voicePlan.amount +
            smsPlan.amount +
            convertPlan.amount

        expect(totalWithoutDiscounts).toBe(
            totalBeforeCancellation - totalCancelledAmount,
        )
        expect(discountAmount).toBe(totalWithoutDiscounts / 2)
        expect(totalWithDiscounts).toBe(totalWithoutDiscounts / 2)
    })

    it('applies multiple discounts sequentially in sorted order', () => {
        const discount1: DiscountVO = {
            ...baseDiscount,
            discount_applicability: DiscountApplicability[1],
            amount_off_in_cents: null,
            percent_off: 50,
            products: [],
        }
        const discount2: DiscountVO = {
            ...baseDiscount,
            discount_applicability: DiscountApplicability[2],
            amount_off_in_cents: null,
            percent_off: 50,
            products: [],
        }

        // Pass in reverse order — sorting should apply discount1 first, then discount2
        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(selectedPlans, [discount2, discount1])

        // 50% off, then 50% off the remainder = 75% total discount
        expect(totalWithDiscounts).toBe(totalWithoutDiscounts / 4)
        expect(discountAmount).toBe((totalWithoutDiscounts * 3) / 4)
    })

    it('applies a specific product discount after an all-products discount', () => {
        const allProducts: DiscountVO = {
            ...baseDiscount,
            discount_applicability: DiscountApplicability[1],
            amount_off_in_cents: null,
            percent_off: 50,
            products: [],
        }
        const helpdeskOnly: DiscountVO = {
            ...baseDiscount,
            discount_applicability: DiscountApplicability[2],
            amount_off_in_cents: null,
            percent_off: 50,
            products: [ProductType.Helpdesk],
        }

        const { totalWithDiscounts } = getTotalWithDiscounts(selectedPlans, [
            allProducts,
            helpdeskOnly,
        ])

        // All products: 22000 → 11000 (50% off)
        // Helpdesk remaining after first discount: 5000 → 2500 (50% off)
        // Rest unchanged at 6000
        // Total: 2500 + 6000 = 8500
        expect(totalWithDiscounts).toBe(8500)
    })

    describe('sort order', () => {
        it('sorts by discount_type when discount_applicability is equal: flat (1) before percentage (2)', () => {
            // flat discount removes a fixed amount; percentage removes a share of the remainder.
            // Applying flat first gives a lower final total than applying percentage first.
            const flatDiscount: DiscountVO = {
                ...baseDiscount,
                discount_applicability: DiscountApplicability[1],
                discount_type: DiscountTypeFlat,
                amount_off_in_cents: 2000,
                percent_off: null,
                products: [],
            }
            const percentageDiscount: DiscountVO = {
                ...baseDiscount,
                discount_applicability: DiscountApplicability[1],
                discount_type: DiscountTypePercentage,
                amount_off_in_cents: null,
                percent_off: 50,
                products: [],
            }

            // Pass percentage first — sorting must reorder so flat runs first.
            const { totalWithDiscounts } = getTotalWithDiscounts(
                selectedPlans,
                [percentageDiscount, flatDiscount],
            )

            // Flat first: 22000 − 2000 = 20000, then 50% → 10000
            expect(totalWithDiscounts).toBe(10000)
        })

        it('sorts by discount_object_type when discount_applicability and discount_type are equal', () => {
            // Two percentage discounts with the same applicability but different object types.
            // object_type 1 must run before object_type 2.
            const objectType1: DiscountVO = {
                ...baseDiscount,
                discount_applicability: DiscountApplicability[1],
                discount_type: DiscountTypePercentage,
                discount_object_type: DiscountObjectType[1],
                amount_off_in_cents: null,
                percent_off: 50,
                products: [],
            }
            const objectType2: DiscountVO = {
                ...baseDiscount,
                discount_applicability: DiscountApplicability[1],
                discount_type: DiscountTypePercentage,
                discount_object_type: DiscountObjectType[2],
                amount_off_in_cents: null,
                percent_off: 50,
                products: [],
            }

            // Pass object_type 2 first — sorting must reorder to run object_type 1 first.
            const {
                totalWithDiscounts,
                totalWithoutDiscounts,
                discountAmount,
            } = getTotalWithDiscounts(selectedPlans, [objectType2, objectType1])

            // 50% off, then 50% off the remainder = 75% total discount (same result either
            // way for all-product discounts, but confirms both discounts ran in sequence).
            expect(totalWithDiscounts).toBe(totalWithoutDiscounts / 4)
            expect(discountAmount).toBe((totalWithoutDiscounts * 3) / 4)
        })

        it('uses all three sort keys together: applicability → discount_type → object_type', () => {
            // Four discounts; the correct result only occurs if all three tiebreakers fire.
            const d1: DiscountVO = {
                ...baseDiscount,
                discount_applicability: DiscountApplicability[1],
                discount_type: DiscountTypeFlat,
                discount_object_type: DiscountObjectType[1],
                amount_off_in_cents: 1000,
                percent_off: null,
                products: [],
            }
            const d2: DiscountVO = {
                ...baseDiscount,
                discount_applicability: DiscountApplicability[1],
                discount_type: DiscountTypeFlat,
                discount_object_type: DiscountObjectType[2],
                amount_off_in_cents: 1000,
                percent_off: null,
                products: [],
            }
            const d3: DiscountVO = {
                ...baseDiscount,
                discount_applicability: DiscountApplicability[1],
                discount_type: DiscountTypePercentage,
                discount_object_type: DiscountObjectType[1],
                amount_off_in_cents: null,
                percent_off: 50,
                products: [],
            }
            const d4: DiscountVO = {
                ...baseDiscount,
                discount_applicability: DiscountApplicability[2],
                discount_type: DiscountTypePercentage,
                discount_object_type: DiscountObjectType[1],
                amount_off_in_cents: null,
                percent_off: 50,
                products: [],
            }

            // Pass in reverse order — correct sort is d1 → d2 → d3 → d4.
            const { totalWithDiscounts } = getTotalWithDiscounts(
                selectedPlans,
                [d4, d3, d2, d1],
            )

            // d1: 22000 − 1000 = 21000
            // d2: 21000 − 1000 = 20000
            // d3: 20000 × 50% → 10000
            // d4: 10000 × 50% → 5000
            // toBeCloseTo because sequential ratio multiplications introduce sub-cent fp drift.
            expect(totalWithDiscounts).toBeCloseTo(5000, 0)
        })
    })
})
