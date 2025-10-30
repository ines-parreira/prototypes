import { getLDClient } from 'utils/launchDarkly'

/**
 * Migration modes for metric execution
 * - off: run only old implementation
 * - shadow: run both, return old result, compare in background
 * - complete: run only new implementation
 */
export type MigrationMode = 'off' | 'shadow' | 'complete'

/**
 * Gets the migration mode from LaunchDarkly for a given flag name
 * This function will be implemented in a separate PR
 * @param flagName - The LaunchDarkly feature flag name
 * @returns The migration mode for the flag
 */
export async function getMigrationMode(
    flagName: string,
): Promise<MigrationMode> {
    const client = getLDClient()
    await client.waitForInitialization(3)
    return client.variation(flagName, 'off')
}
