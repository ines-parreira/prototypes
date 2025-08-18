/* istanbul ignore file */
import { useCallback, useMemo } from 'react'

import { useLocalStorage } from '@repo/hooks'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

export function useAxiomMigration() {
    const hasFlag = useFlag(FeatureFlagKey.AxiomMigration)

    const [isEnabled, setIsEnabled] = useLocalStorage(
        'axiom-migration-enabled-v2',
        false,
    )

    const onToggle = useCallback(() => {
        setIsEnabled((s) => !s)
    }, [setIsEnabled])

    return useMemo(
        () => ({ hasFlag, isEnabled, onToggle }),
        [hasFlag, isEnabled, onToggle],
    )
}
