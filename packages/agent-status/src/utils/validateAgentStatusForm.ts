import type { FormErrors } from '@repo/forms'

import { DURATION_LIMITS } from '../constants'
import type { AgentStatusFormValues } from '../hooks/useAgentStatusFormDefaults'

export function validateAgentStatusForm(
    data: AgentStatusFormValues,
): FormErrors<AgentStatusFormValues> | undefined {
    const errors: FormErrors<AgentStatusFormValues> = {}

    if (!data.name || data.name.trim().length === 0) {
        errors.name = 'Status name is required'
    }

    if (data.durationOption.id === 'custom') {
        if (
            data.customDurationValue === undefined ||
            data.customDurationValue === null
        ) {
            errors.customDurationValue = 'Duration value is required'
        }
        if (!data.customDurationUnit) {
            errors.customDurationUnit = 'Duration unit is required'
        }

        if (
            data.customDurationValue !== undefined &&
            data.customDurationValue !== null &&
            data.customDurationUnit
        ) {
            const limits = DURATION_LIMITS[data.customDurationUnit]
            if (
                data.customDurationValue < limits.min ||
                data.customDurationValue > limits.max
            ) {
                errors.customDurationValue = `Must be between ${limits.min} and ${limits.max} ${data.customDurationUnit}`
            }
        }
    }

    return Object.keys(errors).length > 0 ? errors : undefined
}
