import type { DurationUnit } from '@gorgias/helpdesk-queries'

import { DURATION_OPTIONS } from '../constants'
import type { DurationOption } from '../types'

/**
 * Helper to find matching duration option or return custom
 */
export function findDurationOption(
    unit: DurationUnit | null,
    value: number | null,
): DurationOption {
    // Check for unlimited (both null)
    if (unit === null && value === null) {
        return DURATION_OPTIONS[0] // Unlimited
    }

    // Try to find exact match in preset options
    const match = DURATION_OPTIONS.find(
        (opt) => opt.unit === unit && opt.value === value,
    )

    if (match) {
        return match
    }

    // Default to custom option
    return DURATION_OPTIONS[DURATION_OPTIONS.length - 1] // Custom
}
