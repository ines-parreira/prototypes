import { useCallback, useMemo } from 'react'

import { useLocalStorage } from '@repo/hooks'

import { FeatureFlagKey } from '../featureFlagKey'
import { useFlag } from '../useFlag'

export function useHelpdeskV2BaselineFlag() {
    const [isAxiomMigrationEnabled, setIsAxiomMigrationEnabled] =
        useLocalStorage('axiom-migration-enabled-v3', true)
    const [isEnabled, setIsEnabled] = useLocalStorage('helpdesk-v2-beta', true)

    const hasUIVisionBetaBaselineFlag = useFlag(
        FeatureFlagKey.UIVisionBetaBaseline,
        false,
    )

    const onToggle = useCallback(() => {
        if (isEnabled) {
            setIsEnabled(false)
            setIsAxiomMigrationEnabled(false)
        } else {
            setIsEnabled(true)
            setIsAxiomMigrationEnabled(true)
        }
    }, [isEnabled, setIsEnabled, setIsAxiomMigrationEnabled])

    return useMemo(
        () => ({
            hasUIVisionBetaBaselineFlag,
            hasUIVisionBeta:
                hasUIVisionBetaBaselineFlag &&
                isAxiomMigrationEnabled &&
                isEnabled,
            onToggle,
        }),
        [
            hasUIVisionBetaBaselineFlag,
            isAxiomMigrationEnabled,
            isEnabled,
            onToggle,
        ],
    )
}
