import { z } from 'zod'

import type { RefreshConfig } from './refreshConfig'
import { DEFAULT_REFRESH_CONFIG } from './refreshConfig'

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

export const refreshConfigSchema = z
    .object({
        tickIntervalSeconds: positive,
        maxRecentViews: positiveInt,
        ttlSecondsByCount: ttlSecondsByCountSchema,
        initialFetchTtlSeconds: nonNegative,
    })
    .partial()

export type RefreshConfigOverrides = z.infer<typeof refreshConfigSchema>

/**
 * Validates a flag-provided value and merges it onto
 * `DEFAULT_REFRESH_CONFIG`. Returns the defaults unchanged if the value
 * is missing or fails validation, so a malformed flag payload can never
 * break the v3 scheduler.
 */
export function parseRefreshConfig(value: unknown): RefreshConfig {
    if (value === null || value === undefined) return DEFAULT_REFRESH_CONFIG

    const result = refreshConfigSchema.safeParse(value)
    if (!result.success) return DEFAULT_REFRESH_CONFIG

    return { ...DEFAULT_REFRESH_CONFIG, ...result.data }
}
