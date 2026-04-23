import { useMemo } from 'react'

import { useTreatmentWithConfig } from '@splitsoftware/splitio-react'

import { normalizeFlagId, parseTreatment } from './engines/harness'
import type { FeatureFlagKey } from './featureFlagKey'

/**
 * @deprecated Use `useFlagWithLoading` instead, which also exposes `isLoading: true`
 * until the SDK has finished initializing. This avoids rendering with stale
 * default values before the real flag value is known.
 *
 * @param flag - The feature flag to check from the FeatureFlagKey enum
 * @param defaultValue - The default value to return if the feature flag is not set, defaults to false
 * @returns The value of the feature flag. For JSON flags the reference is
 *   stable across re-renders as long as the upstream-resolved treatment and
 *   config strings are unchanged.
 */
export function useFlag<T = boolean>(
    flag: FeatureFlagKey,
    defaultValue: T = false as T,
): T {
    const { treatment } = useTreatmentWithConfig({
        name: normalizeFlagId(flag),
    })
    const { treatment: rawTreatment, config } = treatment

    return useMemo(
        () => parseTreatment(rawTreatment, config, defaultValue),
        // Keyed on the upstream-resolved strings so parsing happens once per
        // distinct payload and the returned JSON object keeps a stable identity
        // across re-renders. `defaultValue` is intentionally excluded: callers
        // typically pass inline literals, and including it would defeat the
        // memoization. The tradeoff is that a dynamic `defaultValue` stays
        // snapshotted while the flag is unresolved — acceptable, since "stable
        // during loading" is the contract we want.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [rawTreatment, config],
    )
}
