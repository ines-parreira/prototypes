/* istanbul ignore file */
import { useCallback, useMemo } from 'react'

import { useLocalStorage } from '@repo/hooks'

export function useAxiomMigration() {
    const [isEnabled, setIsEnabled] = useLocalStorage(
        'axiom-migration-enabled-v3',
        true,
    )

    const onToggle = useCallback(() => {
        setIsEnabled((s) => !s)
    }, [setIsEnabled])

    return useMemo(
        () => ({
            isEnabled,
            onToggle,
        }),
        [isEnabled, onToggle],
    )
}
