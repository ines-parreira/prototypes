/* istanbul ignore file */
import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useLocalStorage } from '@repo/hooks'

export function useAxiomMigration() {
    const hasFlag = useFlag(FeatureFlagKey.AxiomMigration)

    const [isEnabled, setIsEnabled] = useLocalStorage(
        'axiom-migration-enabled-v3',
        true,
    )

    const [isHighlightingTokens, setHighlightingTokens] = useLocalStorage(
        'axiom-highlight-legacy-tokens',
        false,
    )

    const onToggle = useCallback(() => {
        setIsEnabled((s) => !s)
    }, [setIsEnabled])

    const onToggleTokenHighlighting = useCallback(() => {
        setHighlightingTokens((s) => !s)
    }, [setHighlightingTokens])

    return useMemo(
        () => ({
            hasFlag,
            isEnabled,
            isHighlightingTokens,
            onToggle,
            onToggleTokenHighlighting,
        }),
        [
            hasFlag,
            isEnabled,
            isHighlightingTokens,
            onToggle,
            onToggleTokenHighlighting,
        ],
    )
}
