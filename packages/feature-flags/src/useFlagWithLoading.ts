import { useMemo } from 'react'

import { useTreatmentWithConfig } from '@splitsoftware/splitio-react'

import { normalizeFlagId, parseTreatment } from './engines/harness'
import type { FeatureFlagKey } from './featureFlagKey'

/**
 * Like `useFlag` but also returns `isLoading: true` until the SDK client
 * has finished initializing and the flag value is known.
 *
 * Use this when you need to avoid rendering stale/default flag values (e.g. to
 * prevent a flash of the wrong UI variant).
 *
 * For JSON flags the `value` reference is stable across re-renders as long as
 * the upstream-resolved treatment and config strings are unchanged.
 */
export function useFlagWithLoading<T = boolean>(
    flag: FeatureFlagKey,
    defaultValue: T = false as T,
): { value: T; isLoading: boolean } {
    const { treatment, isReady, isReadyFromCache, hasTimedout } =
        useTreatmentWithConfig({
            name: normalizeFlagId(flag),
        })
    const { treatment: rawTreatment, config } = treatment

    const value = useMemo(
        () => parseTreatment(rawTreatment, config, defaultValue),
        // See the matching comment in `useFlag`: memoize on the upstream
        // resolved strings so JSON flags keep a stable object identity.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [rawTreatment, config],
    )

    const isLoading = !isReady && !isReadyFromCache && !hasTimedout

    return { value, isLoading }
}
