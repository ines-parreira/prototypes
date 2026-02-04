import { useCallback, useMemo } from 'react'

import { useLocalStorage } from '@repo/hooks'

import { FeatureFlagKey } from '../featureFlagKey'
import { useFlag } from '../useFlag'

export function useHelpdeskV2BaselineFlag() {
    const [isEnabled, setIsEnabled] = useLocalStorage('helpdesk-v2-beta', true)

    const hasUIVisionBetaBaselineFlag = useFlag(
        FeatureFlagKey.UIVisionBetaBaseline,
        false,
    )

    const onToggle = useCallback(() => {
        setIsEnabled((s) => !s)
    }, [setIsEnabled])

    return useMemo(
        () => ({
            hasUIVisionBetaBaselineFlag,
            hasUIVisionBeta: hasUIVisionBetaBaselineFlag && isEnabled,
            onToggle,
        }),
        [hasUIVisionBetaBaselineFlag, isEnabled, onToggle],
    )
}
