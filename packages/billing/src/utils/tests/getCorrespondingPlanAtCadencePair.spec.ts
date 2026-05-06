import { InvoiceCadence } from '@gorgias/helpdesk-types'

import {
    basicMonthlyHelpdeskPlan,
    basicYearlyHelpdeskPlan,
    basicYearlyInvoicedMonthlyHelpdeskPlanGen4,
    basicYearlyInvoicedMonthlyHelpdeskPlanGen5,
    basicYearlyInvoicedMonthlyHelpdeskPlanGen5Variant1,
    basicYearlyInvoicedMonthlyHelpdeskPlanGen5Variant5,
    proMonthlyHelpdeskPlan,
    proYearlyInvoicedMonthlyHelpdeskPlanGen5Variant1,
} from '../../fixtures.data'
import { Cadence } from '../../types'
import { getCorrespondingPlanAtCadencePair } from '../getCorrespondingPlanAtCadencePair'

describe('getCorrespondingPlanAtCadencePair', () => {
    it('returns the exact generation match when available', () => {
        const result = getCorrespondingPlanAtCadencePair({
            availablePlans: [
                basicYearlyInvoicedMonthlyHelpdeskPlanGen5,
                basicYearlyInvoicedMonthlyHelpdeskPlanGen4,
            ],
            currentPlan: basicMonthlyHelpdeskPlan,
            contractCadence: Cadence.Year,
            invoiceCadence: InvoiceCadence.Month,
        })

        expect(result).toBe(basicYearlyInvoicedMonthlyHelpdeskPlanGen4)
    })

    it('falls back to a newer generation when the current generation does not have a yearly-invoiced_ plan', () => {
        const result = getCorrespondingPlanAtCadencePair({
            availablePlans: [basicYearlyInvoicedMonthlyHelpdeskPlanGen5],
            currentPlan: basicMonthlyHelpdeskPlan,
            contractCadence: Cadence.Year,
            invoiceCadence: InvoiceCadence.Month,
        })

        expect(result).toBe(basicYearlyInvoicedMonthlyHelpdeskPlanGen5)
    })

    it('returns undefined when no yearly-invoiced_ plan exists for any generation', () => {
        const result = getCorrespondingPlanAtCadencePair({
            availablePlans: [basicYearlyHelpdeskPlan],
            currentPlan: basicMonthlyHelpdeskPlan,
            contractCadence: Cadence.Year,
            invoiceCadence: InvoiceCadence.Month,
        })

        expect(result).toBeUndefined()
    })

    it('returns fallback by cadence when currentPlan is not provided', () => {
        const result = getCorrespondingPlanAtCadencePair({
            availablePlans: [basicYearlyInvoicedMonthlyHelpdeskPlanGen5],
            currentPlan: undefined,
            contractCadence: Cadence.Year,
            invoiceCadence: InvoiceCadence.Month,
        })

        expect(result).toBe(basicYearlyInvoicedMonthlyHelpdeskPlanGen5)
    })

    it('returns the same plan when cadence pair matches current plan', () => {
        const result = getCorrespondingPlanAtCadencePair({
            availablePlans: [
                basicMonthlyHelpdeskPlan,
                basicYearlyInvoicedMonthlyHelpdeskPlanGen5,
            ],
            currentPlan: basicMonthlyHelpdeskPlan,
            contractCadence: Cadence.Month,
            invoiceCadence: InvoiceCadence.Month,
        })

        expect(result).toBe(basicMonthlyHelpdeskPlan)
    })

    it('preserves variant number when falling back to a different generation', () => {
        const currentPlanWithVariant = {
            ...basicMonthlyHelpdeskPlan,
            plan_id: 'basic-monthly-usd-4-5',
        }

        const result = getCorrespondingPlanAtCadencePair({
            availablePlans: [
                basicYearlyInvoicedMonthlyHelpdeskPlanGen5Variant5,
            ],
            currentPlan: currentPlanWithVariant,
            contractCadence: Cadence.Year,
            invoiceCadence: InvoiceCadence.Month,
        })

        expect(result).toBe(basicYearlyInvoicedMonthlyHelpdeskPlanGen5Variant5)
    })

    it('finds the first plan of the same tier when source has no variant and target generation introduces variants', () => {
        const result = getCorrespondingPlanAtCadencePair({
            availablePlans: [
                basicYearlyInvoicedMonthlyHelpdeskPlanGen5Variant1,
                proYearlyInvoicedMonthlyHelpdeskPlanGen5Variant1,
            ],
            currentPlan: proMonthlyHelpdeskPlan,
            contractCadence: Cadence.Year,
            invoiceCadence: InvoiceCadence.Month,
        })

        expect(result).toBe(proYearlyInvoicedMonthlyHelpdeskPlanGen5Variant1)
    })

    it('falls back to cadence match when no plan with the same variant exists', () => {
        const currentPlanWithVariant = {
            ...basicMonthlyHelpdeskPlan,
            plan_id: 'basic-monthly-usd-4-5',
        }

        const result = getCorrespondingPlanAtCadencePair({
            availablePlans: [
                basicYearlyInvoicedMonthlyHelpdeskPlanGen5Variant1,
            ],
            currentPlan: currentPlanWithVariant,
            contractCadence: Cadence.Year,
            invoiceCadence: InvoiceCadence.Month,
        })

        expect(result).toBe(basicYearlyInvoicedMonthlyHelpdeskPlanGen5Variant1)
    })

    it('returns subscriptionPlan when target cadences match the subscription cadences, regardless of currentPlan', () => {
        const result = getCorrespondingPlanAtCadencePair({
            availablePlans: [basicYearlyInvoicedMonthlyHelpdeskPlanGen5],
            currentPlan: basicYearlyInvoicedMonthlyHelpdeskPlanGen5,
            subscriptionPlan: basicMonthlyHelpdeskPlan,
            contractCadence: Cadence.Month,
            invoiceCadence: InvoiceCadence.Month,
        })

        expect(result).toBe(basicMonthlyHelpdeskPlan)
    })
})
