import { z } from 'zod'

import type { RefreshConfigV3 } from './refreshConfigV3'
import { DEFAULT_REFRESH_CONFIG_V3 } from './refreshConfigV3'

const positive = z.number().positive()
const positiveInt = z.number().int().positive()
const nonNegative = z.number().nonnegative()

/**
 * Step table — keys are stringified non-negative integers, values are
 * positive TTLs in seconds. JSON keys can only be strings; we validate the
 * shape and rebuild a `Record<number, number>` so the scheduler can index
 * by numeric threshold.
 */
const ttlSecondsByCountSchema = z
    .record(
        z.string().regex(/^\d+$/, 'count threshold must be an integer'),
        positive,
    )
    .transform((rec) => {
        const out: Record<number, number> = {}
        for (const [key, value] of Object.entries(rec)) {
            out[Number(key)] = value
        }
        return out
    })

export const refreshConfigSchemaV3 = z
    .object({
        tickIntervalSeconds: positive,
        maxRecentViews: positiveInt,
        ttlSecondsByCount: ttlSecondsByCountSchema,
        fetchAllMinCooldownSeconds: nonNegative,
    })
    .partial()

export type RefreshConfigOverridesV3 = z.infer<typeof refreshConfigSchemaV3>

/**
 * Validates a flag-provided value and merges it onto
 * `DEFAULT_REFRESH_CONFIG_V3`. Returns the defaults unchanged if the value
 * is missing or fails validation, so a malformed flag payload can never
 * break the v3 scheduler.
 */
export function parseRefreshConfigV3(value: unknown): RefreshConfigV3 {
    if (value === null || value === undefined) return DEFAULT_REFRESH_CONFIG_V3

    const result = refreshConfigSchemaV3.safeParse(value)
    if (!result.success) return DEFAULT_REFRESH_CONFIG_V3

    return { ...DEFAULT_REFRESH_CONFIG_V3, ...result.data }
}
