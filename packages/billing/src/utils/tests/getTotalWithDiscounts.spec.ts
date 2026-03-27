import { InvoiceCadence } from '@gorgias/helpdesk-types'

import { Cadence, HelpdeskPlanTier, ProductType } from '../../types'
import type {
    AutomatePlan,
    ConvertPlan,
    HelpdeskPlan,
    SelectedPlans,
    SMSOrVoicePlan,
} from '../../types'
import { getTotalWithDiscounts } from '../getTotalWithDiscounts'

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

describe('getTotalWithDiscounts', () => {
    it('returns the base amounts when coupon is null', () => {
        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(selectedPlans, null)

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

    it('applies percent discounts to every selected product when coupon products is empty', () => {
        const coupon = {
            amount_off_in_cents: null,
            percent_off: 50,
            products: [],
        }

        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(selectedPlans, coupon)

        expect(discountAmount).toBe(totalWithoutDiscounts / 2)
        expect(totalWithDiscounts).toBe(totalWithoutDiscounts / 2)
    })

    it('only discounts whitelisted products', () => {
        const coupon = {
            amount_off_in_cents: null,
            percent_off: 50,
            products: [ProductType.Helpdesk],
        }

        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(selectedPlans, coupon)

        expect(discountAmount).toBe(proMonthlyHelpdeskPlan.amount / 2)
        expect(totalWithDiscounts).toBe(
            totalWithoutDiscounts - proMonthlyHelpdeskPlan.amount / 2,
        )
    })

    it('caps flat discounts at the eligible amount', () => {
        const coupon = {
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
            getTotalWithDiscounts(singleProductSelection, coupon)

        expect(totalWithoutDiscounts).toBe(proMonthlyHelpdeskPlan.amount)
        expect(discountAmount).toBe(proMonthlyHelpdeskPlan.amount)
        expect(totalWithDiscounts).toBe(0)
    })

    it('subtracts cancellations before applying a percentage discount', () => {
        const coupon = {
            amount_off_in_cents: null,
            percent_off: 50,
            products: [],
        }

        const totalCancelledAmount = 3000
        const { totalWithDiscounts, totalWithoutDiscounts, discountAmount } =
            getTotalWithDiscounts(selectedPlans, coupon, totalCancelledAmount)

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
})
