import { z } from 'zod'

import type { RefreshConfig } from './selectViewsToRefresh'
import { DEFAULT_REFRESH_CONFIG } from './selectViewsToRefresh'

const positive = z.number().positive()
const positiveInt = z.number().int().positive()
const nonNegativeInt = z.number().int().nonnegative()

export const refreshConfigSchema = z
    .object({
        tickIntervalSeconds: positive,
        minRefreshIntervalSeconds: positive,
        maxViewsPerTick: positiveInt,
        maxRealtimePerTick: nonNegativeInt,
        largeCountThreshold: positive,
        recentlyActiveWindowSeconds: positive,
        staleSeconds: positive,
    })
    .partial()

export type RefreshConfigOverrides = z.infer<typeof refreshConfigSchema>

/**
 * Validates a flag-provided value and merges it onto `DEFAULT_REFRESH_CONFIG`.
 * Returns the defaults unchanged if the value is missing or fails validation,
 * so a malformed Split payload can never break the scheduler.
 */
export function parseRefreshConfig(value: unknown): RefreshConfig {
    if (value === null || value === undefined) return DEFAULT_REFRESH_CONFIG

    const result = refreshConfigSchema.safeParse(value)
    if (!result.success) return DEFAULT_REFRESH_CONFIG

    return { ...DEFAULT_REFRESH_CONFIG, ...result.data }
}
