import { ProductType } from 'models/billing/types'

import {
    AI_AGENT_CANCELLATION_SCENARIO,
    CONVERT_CANCELLATION_SCENARIO,
    HELPDESK_CANCELLATION_SCENARIO,
} from './scenarios'
import type { CancellationScenario, Reason } from './types'

export const findCancellationScenarioByProductType = (
    productType: ProductType,
): CancellationScenario => {
    switch (productType) {
        case ProductType.Helpdesk:
            return HELPDESK_CANCELLATION_SCENARIO
        case ProductType.Automation:
            return AI_AGENT_CANCELLATION_SCENARIO
        case ProductType.Convert:
            return CONVERT_CANCELLATION_SCENARIO
        default:
            throw new Error(
                `Cancellation script not found for ${productType} product.`,
            )
    }
}

export const formatCancellationReasonsForZapier = (
    primaryReason: Reason | null,
    secondaryReason: Reason | null,
    otherReason: Reason | null,
): string => {
    const reasons: string[] = []

    if (primaryReason) {
        reasons.push(`Primary: ${primaryReason.label}`)
    }

    if (secondaryReason) {
        reasons.push(`Secondary: ${secondaryReason.label}`)
    }

    if (otherReason) {
        reasons.push(`Additional details: ${otherReason.label}`)
    }

    return reasons.join('\n')
}
