import { useEffect, useState } from 'react'

import { ensureInitialization } from '../utils/launchDarklyInitialization'

/**
 * Hook that returns whether LaunchDarkly flags are ready to be used.
 * This is useful for components that need to wait for all flags to be loaded
 * before rendering to avoid UI flickering.
 *
 * @returns boolean indicating if flags are ready
 */
export default function useAreFlagsLoading(): boolean {
    const [areFlagsLoading, setAreFlagsLoading] = useState(true)

    useEffect(() => {
        void (async () => {
            try {
                await ensureInitialization()
            } catch (error) {
                console.error('Error waiting for flags to be ready', error)
            } finally {
                // Even if initialization fails, we should set flags as "ready"
                // so the UI doesn't get stuck in a loading state
                setAreFlagsLoading(false)
            }
        })()
    }, [])

    return areFlagsLoading
}
