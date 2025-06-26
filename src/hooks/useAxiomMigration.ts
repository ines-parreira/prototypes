/* istanbul ignore file */
import { useCallback, useMemo } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useLocalStorage from 'hooks/useLocalStorage'

export function useAxiomMigration() {
    const hasFlag = useFlag(FeatureFlagKey.AxiomMigration)

    const [isEnabled, setIsEnabled] = useLocalStorage(
        'axiom-migration-enabled',
        true,
    )

    const onToggle = useCallback(() => {
        setIsEnabled((s) => !s)
    }, [setIsEnabled])

    return useMemo(
        () => ({ hasFlag, isEnabled, onToggle }),
        [hasFlag, isEnabled, onToggle],
    )
}
