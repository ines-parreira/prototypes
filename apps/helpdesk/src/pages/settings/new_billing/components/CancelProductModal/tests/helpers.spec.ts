import { ProductType } from 'models/billing/types'

import {
    findCancellationScenarioByProductType,
    formatCancellationReasonsForZapier,
} from '../helpers'
import {
    AI_AGENT_CANCELLATION_SCENARIO,
    CONVERT_CANCELLATION_SCENARIO,
    HELPDESK_CANCELLATION_SCENARIO,
    SMS_CANCELLATION_SCENARIO,
    VOICE_CANCELLATION_SCENARIO,
} from '../scenarios'
import type { Reason } from '../types'

describe('findCancellationScenarioByProductType', () => {
    it('should return Helpdesk cancellation script for Helpdesk product', () => {
        const result = findCancellationScenarioByProductType(
            ProductType.Helpdesk,
        )
        expect(result).toEqual(HELPDESK_CANCELLATION_SCENARIO)
    })

    it('should return AI Agent cancellation script for Automation product', () => {
        const result = findCancellationScenarioByProductType(
            ProductType.Automation,
        )
        expect(result).toEqual(AI_AGENT_CANCELLATION_SCENARIO)
    })

    it('should return Convert cancellation script for Convert product', () => {
        const result = findCancellationScenarioByProductType(
            ProductType.Convert,
        )
        expect(result).toEqual(CONVERT_CANCELLATION_SCENARIO)
    })

    it('should return SMS cancellation script for SMS product', () => {
        const result = findCancellationScenarioByProductType(ProductType.SMS)
        expect(result).toEqual(SMS_CANCELLATION_SCENARIO)
    })

    it('should return Voice cancellation script for Voice product', () => {
        const result = findCancellationScenarioByProductType(ProductType.Voice)
        expect(result).toEqual(VOICE_CANCELLATION_SCENARIO)
    })
})

describe('formatCancellationReasonsForZapier', () => {
    it('should format all three reasons', () => {
        const primaryReason: Reason = { label: 'Too expensive' }
        const secondaryReason: Reason = { label: 'Not enough features' }
        const otherReason: Reason = { label: 'I found a better alternative' }

        const result = formatCancellationReasonsForZapier(
            primaryReason,
            secondaryReason,
            otherReason,
        )

        expect(result).toBe(
            'Primary: Too expensive\n' +
                'Secondary: Not enough features\n' +
                'Additional details: I found a better alternative',
        )
    })

    it('should format only primary reason when others are null', () => {
        const primaryReason: Reason = { label: 'Too expensive' }

        const result = formatCancellationReasonsForZapier(
            primaryReason,
            null,
            null,
        )

        expect(result).toBe('Primary: Too expensive')
    })

    it('should format primary and secondary reasons when other is null', () => {
        const primaryReason: Reason = { label: 'Too expensive' }
        const secondaryReason: Reason = { label: 'Not enough features' }

        const result = formatCancellationReasonsForZapier(
            primaryReason,
            secondaryReason,
            null,
        )

        expect(result).toBe(
            'Primary: Too expensive\nSecondary: Not enough features',
        )
    })

    it('should format primary and other reasons when secondary is null', () => {
        const primaryReason: Reason = { label: 'Too expensive' }
        const otherReason: Reason = { label: 'I found a better alternative' }

        const result = formatCancellationReasonsForZapier(
            primaryReason,
            null,
            otherReason,
        )

        expect(result).toBe(
            'Primary: Too expensive\nAdditional details: I found a better alternative',
        )
    })

    it('should return empty string when all reasons are null', () => {
        const result = formatCancellationReasonsForZapier(null, null, null)

        expect(result).toBe('')
    })
})
