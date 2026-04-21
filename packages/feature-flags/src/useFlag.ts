import { useEffect, useRef, useState } from 'react'

import { useTreatmentWithConfig } from '@splitsoftware/splitio-react'

import {
    evaluateFlag,
    getPrimaryEngineId,
    subscribeToFlag,
} from './dualEvaluation'
import { normalizeFlagId, parseTreatment } from './engines/harness'
import { ensureInitialization } from './engines/launchdarkly'
import type { FeatureFlagKey } from './featureFlagKey'

/**
 * @deprecated Use `useFlagWithLoading` instead, which also exposes `isLoading: true`
 * until the SDK has finished initializing. This avoids rendering with stale
 * default values before the real flag value is known.
 *
 * @param flag - The feature flag to check from the FeatureFlagKey enum
 * @param defaultValue - The default value to return if the feature flag is not set, defaults to false
 * @returns The value of the feature flag
 */
export function useFlag<T = boolean>(
    flag: FeatureFlagKey,
    defaultValue: T = false as T,
): T {
    // Both engine-specific hooks are always called to satisfy React's rules of
    // hooks; only the primary engine's value is returned. `getPrimaryEngineId()`
    // is driven by an LD boolean flag evaluated at boot, so it's stable for
    // the lifetime of the session.
    const harnessValue = useHarnessFlag(flag, defaultValue)
    const ldValue = useLDFlag(flag, defaultValue)
    return getPrimaryEngineId() === 'harness' ? harnessValue : ldValue
}

function useHarnessFlag<T>(flag: FeatureFlagKey, defaultValue: T): T {
    const { treatment } = useTreatmentWithConfig({
        name: normalizeFlagId(flag),
    })
    return parseTreatment(treatment.treatment, treatment.config, defaultValue)
}

function useLDFlag<T>(flag: FeatureFlagKey, defaultValue: T): T {
    // Keep the latest default in a ref so callers don't need to memoize
    // object/array defaults — including `defaultValue` directly in the effect
    // deps would cause an unsubscribe + re-subscribe churn on every render
    // for callers passing a fresh object literal.
    const defaultValueRef = useRef(defaultValue)
    defaultValueRef.current = defaultValue

    const [value, setValue] = useState<T>(() =>
        evaluateFlag(flag, defaultValue),
    )

    useEffect(() => {
        void (async () => {
            try {
                await ensureInitialization()
                setValue(evaluateFlag(flag, defaultValueRef.current))
            } catch (error) {
                console.error('Error fetching feature flag', error)
            }
        })()
    }, [flag])

    useEffect(() => {
        return subscribeToFlag(flag, defaultValueRef.current, (newValue) =>
            setValue(newValue as T),
        )
    }, [flag])

    return value
}
