import { useEffect, useState } from 'react'

import { ensureInitialization } from './engines/launchdarkly'

/**
 * Hook that returns whether feature flags are ready to be used.
 * This is useful for components that need to wait for all flags to be loaded
 * before rendering to avoid UI flickering.
 *
 * @returns boolean indicating if flags are loading
 */
export function useAreFlagsLoading(): boolean {
    const [areFlagsLoading, setAreFlagsLoading] = useState(true)

    useEffect(() => {
        void (async () => {
            try {
                await ensureInitialization()
            } catch (error) {
                console.error('Error waiting for flags to be ready', error)
            } finally {
                setAreFlagsLoading(false)
            }
        })()
    }, [])

    return areFlagsLoading
}
