import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { parseRefreshConfig } from '../scheduler/refreshConfigSchema'
import type { RefreshConfig } from '../scheduler/selectViewsToRefresh'

/**
 * Resolves the view-count scheduler config from the
 * `ViewCountSchedulerConfig` JSON flag, falling back to
 * `DEFAULT_REFRESH_CONFIG` if the flag is unset or the payload doesn't
 * pass schema validation. Lets us tweak scheduler tuning at runtime
 * without a deploy while keeping the safe defaults as a backstop.
 */
export function useSchedulerConfig(): RefreshConfig {
    const value = useFlag<unknown>(
        FeatureFlagKey.ViewCountSchedulerConfig,
        null,
    )

    return useMemo(() => parseRefreshConfig(value), [value])
}
