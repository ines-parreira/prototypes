import { InvoiceCadence } from '@gorgias/helpdesk-types'

import type { HelpdeskPlan } from './types'
import { Cadence, ProductType } from './types'
import {
    generatePaymentPlanLabel,
    getProductTrackingName,
    isYearlyContractPlan,
} from './utils'

describe('getProductTrackingName', () => {
    it('should return "helpdesk" for ProductType.Helpdesk', () => {
        expect(getProductTrackingName(ProductType.Helpdesk)).toBe('helpdesk')
    })

    it('should return "ai_agent" for ProductType.Automation', () => {
        expect(getProductTrackingName(ProductType.Automation)).toBe('ai_agent')
    })

    it('should return "voice" for ProductType.Voice', () => {
        expect(getProductTrackingName(ProductType.Voice)).toBe('voice')
    })

    it('should return "sms" for ProductType.SMS', () => {
        expect(getProductTrackingName(ProductType.SMS)).toBe('sms')
    })

    it('should return "convert" for ProductType.Convert', () => {
        expect(getProductTrackingName(ProductType.Convert)).toBe('convert')
    })
})

describe('isYearlyContractPlan', () => {
    it('should return true when cadence differs from invoice_cadence (yearly, biannually)', () => {
        const plan = {
            cadence: Cadence.Year,
            invoice_cadence: InvoiceCadence.Biannual,
        } as HelpdeskPlan

        expect(isYearlyContractPlan(plan)).toBe(true)
    })

    it('should return true when cadence differs from invoice_cadence (yearly, quarterly)', () => {
        const plan = {
            cadence: Cadence.Year,
            invoice_cadence: InvoiceCadence.Quarter,
        } as HelpdeskPlan

        expect(isYearlyContractPlan(plan)).toBe(true)
    })

    it('should return true when cadence differs from invoice_cadence (yearly, monthly)', () => {
        const plan = {
            cadence: Cadence.Year,
            invoice_cadence: InvoiceCadence.Month,
        } as HelpdeskPlan

        expect(isYearlyContractPlan(plan)).toBe(true)
    })

    it('should return false when cadence equals invoice_cadence (yearly)', () => {
        const plan = {
            cadence: Cadence.Year,
            invoice_cadence: InvoiceCadence.Year,
        } as HelpdeskPlan

        expect(isYearlyContractPlan(plan)).toBe(false)
    })

    it('should return false when cadence equals invoice_cadence (monthly)', () => {
        const plan = {
            cadence: Cadence.Month,
            invoice_cadence: InvoiceCadence.Month,
        } as HelpdeskPlan

        expect(isYearlyContractPlan(plan)).toBe(false)
    })

    it('should return false when plan is undefined', () => {
        expect(isYearlyContractPlan(undefined)).toBe(false)
    })
})

describe('generatePaymentPlanLabel', () => {
    describe('standard plans', () => {
        it('should return "Billed Monthly" for standard monthly plan', () => {
            const plan = {
                cadence: Cadence.Month,
                invoice_cadence: InvoiceCadence.Month,
            } as HelpdeskPlan

            expect(generatePaymentPlanLabel(plan)).toBe('Billed Monthly')
        })

        it('should return "Billed Quarterly" for standard quarterly plan', () => {
            const plan = {
                cadence: Cadence.Quarter,
                invoice_cadence: InvoiceCadence.Quarter,
            } as HelpdeskPlan

            expect(generatePaymentPlanLabel(plan)).toBe('Billed Quarterly')
        })

        it('should return "Billed Yearly" for standard yearly plan', () => {
            const plan = {
                cadence: Cadence.Year,
                invoice_cadence: InvoiceCadence.Year,
            } as HelpdeskPlan

            expect(generatePaymentPlanLabel(plan)).toBe('Billed Yearly')
        })
    })

    describe('custom plans', () => {
        it('should return "Annual plan (billed quarterly)" for annual plan billed quarterly', () => {
            const plan = {
                cadence: Cadence.Year,
                invoice_cadence: InvoiceCadence.Quarter,
            } as HelpdeskPlan

            expect(generatePaymentPlanLabel(plan)).toBe(
                'Annual plan (billed quarterly)',
            )
        })

        it('should return "Annual plan (billed monthly)" for annual plan billed monthly', () => {
            const plan = {
                cadence: Cadence.Year,
                invoice_cadence: InvoiceCadence.Month,
            } as HelpdeskPlan

            expect(generatePaymentPlanLabel(plan)).toBe(
                'Annual plan (billed monthly)',
            )
        })

        it('should return "Annual plan (billed monthly)" for quarterly plan billed monthly', () => {
            const plan = {
                cadence: Cadence.Quarter,
                invoice_cadence: InvoiceCadence.Month,
            } as HelpdeskPlan

            expect(generatePaymentPlanLabel(plan)).toBe(
                'Annual plan (billed monthly)',
            )
        })
    })

    describe('edge cases', () => {
        it('should default to "Billed Monthly" when plan is undefined', () => {
            expect(generatePaymentPlanLabel(undefined)).toBe('Billed Monthly')
        })
    })
})
