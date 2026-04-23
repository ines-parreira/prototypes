/**
 * Migration stage
 * - off: run only old implementation
 * - shadow: run both, return old result
 * - live: run both, return new result
 * - complete: run only new implementation
 */
export type MigrationStage = 'off' | 'shadow' | 'live' | 'complete'

/**
 * Helper for running dual-write/dual-read style migrations behind a feature flag.
 *
 * @param migrationMode - The migration stage to read from
 * @param v1 - The "old" branch of the code, called in off/shadow/live and returned in off/shadow modes
 * @param v2 - The "new" branch of the code, called in shadow/live/complete and returned in live/complete modes
 * @param comparison - Optional comparison method for results, used in shadow/live modes
 * @returns The return value of the authoritative branch ("old" in off/shadow, "new" in live/complete)
 */
export async function readMigration<T>(
    migrationMode: MigrationStage = 'off',
    v1: () => Promise<T>,
    v2: () => Promise<T>,
    comparison?: (v1: T, v2: T) => boolean,
): Promise<T> {
    // For simple modes, we simply return the correct branch as-is
    if (migrationMode === 'off') return v1()
    if (migrationMode === 'complete') return v2()

    // For more complex modes (shadow/live) we run both branches in parallel
    const [oldResult, newResult] = await Promise.allSettled([v1(), v2()])

    // Call the comparison method only if both branches succeeded
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
