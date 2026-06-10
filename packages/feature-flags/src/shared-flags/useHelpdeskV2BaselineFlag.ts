import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useLocalStorage } from '@gorgias/toolkit-react'

import { FeatureFlagKey } from '../featureFlagKey'
import { useFlag } from '../useFlag'

export function useHelpdeskV2BaselineFlag() {
    const [isEnabled, setIsEnabled] = useLocalStorage('helpdesk-v2-beta', true)

    const hasUIVisionBetaBaselineFlag = useFlag(
        FeatureFlagKey.UIVisionBetaBaseline,
        false,
    )

    const onToggle = useCallback(() => {
        const nextIsEnabled = !isEnabled

        logEvent(SegmentEvent.HelpdeskV2ToggleChanged, {
            current_toggle_enabled: isEnabled,
            next_toggle_enabled: nextIsEnabled,
        })

        setIsEnabled(nextIsEnabled)
    }, [isEnabled, setIsEnabled])

    return useMemo(
        () => ({
            hasUIVisionBetaBaselineFlag,
            hasUIVisionBeta: hasUIVisionBetaBaselineFlag && isEnabled,
            onToggle,
        }),
        [hasUIVisionBetaBaselineFlag, isEnabled, onToggle],
    )
}
