import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { parseRefreshConfigV3 } from '../scheduler/refreshConfigSchemaV3'
import type { RefreshConfigV3 } from '../scheduler/refreshConfigV3'

/**
 * Resolves the v3 scheduler config from the `ViewCountSchedulerV3Config`
 * JSON flag, falling back to `DEFAULT_REFRESH_CONFIG_V3` if the flag is
 * unset or the payload doesn't pass schema validation. Lets us tune the
 * v3 tick cadence, recent-set size, and per-count TTL at runtime without
 * a deploy while keeping safe defaults as a backstop.
 */
export function useSchedulerConfigV3(): RefreshConfigV3 {
    const value = useFlag<unknown>(
        FeatureFlagKey.ViewCountSchedulerV3Config,
        null,
    )

    return useMemo(() => parseRefreshConfigV3(value), [value])
}
