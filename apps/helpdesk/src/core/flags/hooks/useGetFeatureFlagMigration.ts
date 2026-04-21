import type { FeatureFlagKey, MigrationStage } from '@repo/feature-flags'
import { useFlagWithLoading } from '@repo/feature-flags'
import { reportError } from '@repo/logging'

const ALLOWED_VALUES: Set<MigrationStage> = new Set([
    'off',
    'shadow',
    'live',
    'complete',
])

export function useGetFeatureFlagMigration(
    flag: FeatureFlagKey,
    defaultValue: MigrationStage = 'off',
): { migrationStage: MigrationStage; isLoading: boolean } {
    const { value, isLoading } = useFlagWithLoading<MigrationStage>(
        flag,
        defaultValue,
    )
    if (!ALLOWED_VALUES.has(value)) {
        reportError('Unknown migration stage: ' + value)
        return { migrationStage: defaultValue, isLoading }
    }
    return { migrationStage: value, isLoading }
}
