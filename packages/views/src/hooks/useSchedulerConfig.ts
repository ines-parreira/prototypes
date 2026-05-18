import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import type { RefreshConfig } from '../scheduler/refreshConfig'
import { parseRefreshConfig } from '../scheduler/refreshConfigSchema'

/**
 * Resolves the v3 scheduler config from the `ViewCountSchedulerV3Config`
 * JSON flag, falling back to `DEFAULT_REFRESH_CONFIG` if the flag is
 * unset or the payload doesn't pass schema validation. Lets us tune the
 * v3 tick cadence, recent-set size, and per-count TTL at runtime without
 * a deploy while keeping safe defaults as a backstop.
 */
export function useSchedulerConfig(): RefreshConfig {
    const value = useFlag<unknown>(
        FeatureFlagKey.ViewCountSchedulerV3Config,
        null,
    )

    return useMemo(() => parseRefreshConfig(value), [value])
}
