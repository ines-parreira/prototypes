import { FeatureFlagKey } from '@repo/feature-flags'

import { getLDClient } from 'utils/launchDarkly'

/**
 * Migration stage
 * - off: run only old implementation
 * - shadow: run both, return old result
 * - live: run both, return new result
 * - complete: run only new implementation
 */
export type MigrationStage = 'off' | 'shadow' | 'live' | 'complete'

/**
 * @param flag - The feature flag to check from the FeatureFlagKey enum
 * @param defaultValue - The default value to return if the feature flag is not set, defaults to OFF
 * @returns The active migration stage for this flag
 */
export async function getMigrationStage(
    flag: FeatureFlagKey,
    defaultValue: MigrationStage = 'off',
): Promise<MigrationStage> {
    const client = getLDClient()
    await client.waitForInitialization(3)
    return client.variation(flag, defaultValue) || defaultValue
}

/**
 * Custom implementation of LaunchDarkly migration flags as their current JS SDK does not support them.
 * Does not send analytics events to LaunchDarkly and as such does not have nice graphs in their interface.
 *
 * @see https://launchdarkly.com/docs/home/flags/migration
 *
 * @param flag - The feature flag to check from the FeatureFlagKey enum
 * @param v1 - The "old" branch of the code, called in off/shadow/live and returned in off/shadow modes
 * @param v2 - The "new" branch of the code, called in shadow/live/complete and returned in live/complete modes
 * @param comparison - Optional comparison method for results, used in shadow/live modes
 * @param defaultValue - The default value to return if the feature flag is not set, defaults to OFF
 * @returns The return value of the authoritative branch ("old" in off/shadow, "new" in live/complete)
 */
export default async function readMigration<T>(
    flag: FeatureFlagKey,
    v1: () => Promise<T>,
    v2: () => Promise<T>,
    comparison?: (v1: T, v2: T) => boolean,
    defaultValue: MigrationStage = 'off',
): Promise<T> {
    const migrationMode = await getMigrationStage(flag, defaultValue)

    // For simple modes, we simply return the correct branch as-is
    if (migrationMode === 'off') return v1()
    if (migrationMode === 'complete') return v2()

    // For more complex modes (shadow/live) we run both branches in parallel
    const [oldResult, newResult] = await Promise.allSettled([v1(), v2()])

    // Call the comparison method only if both branches succeeeded
    if (
        comparison &&
        oldResult.status === 'fulfilled' &&
        newResult.status === 'fulfilled'
    )
        comparison(oldResult.value, newResult.value)

    // Return the result from the authoritative branch as-is
    const authoritative = migrationMode === 'shadow' ? oldResult : newResult
    if (authoritative.status === 'rejected') throw authoritative.reason
    return authoritative.value
}
