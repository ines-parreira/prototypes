import type { FeatureFlagKey, MigrationStage } from '@repo/feature-flags'
import { useFlag } from '@repo/feature-flags'
import { reportError } from '@repo/logging'

const ALLOWED_VALUES: Set<MigrationStage> = new Set([
    'off',
    'shadow',
    'live',
    'complete',
])

/**
 * @param flag - The feature flag to check from the FeatureFlagKey enum
 * @param defaultValue - The default value to return if the feature flag is not set, defaults to 'off'
 * @returns The active migration stage for this flag
 */
export function useGetFeatureFlagMigration(
    flag: FeatureFlagKey,
    defaultValue: MigrationStage = 'off',
): MigrationStage {
    const migrationStage = useFlag<MigrationStage>(flag, defaultValue)
    if (!ALLOWED_VALUES.has(migrationStage)) {
        reportError('Unknown migration stage: ' + migrationStage)
        return defaultValue
    }
    return migrationStage
}
