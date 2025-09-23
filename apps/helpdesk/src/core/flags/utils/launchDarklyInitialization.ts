import { getLDClient } from 'utils/launchDarkly'

// Shared initialization promise to avoid multiple waitForInitialization calls
let initializationPromise: Promise<void> | null = null

export function ensureInitialization(): Promise<void> {
    if (!initializationPromise) {
        const client = getLDClient()
        initializationPromise = client
            .waitForInitialization(3)
            .catch((error) => {
                console.error('Error during LaunchDarkly initialization', error)
                // Reset the promise so it can be retried
                initializationPromise = null
                throw error
            })
    }
    return initializationPromise
}
