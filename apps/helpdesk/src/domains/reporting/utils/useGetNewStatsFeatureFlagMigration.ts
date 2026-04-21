import type { MigrationStage } from '@repo/feature-flags'

import { useGetFeatureFlagMigration } from 'core/flags/hooks/useGetFeatureFlagMigration'
import { resolveMetricFlag } from 'core/flags/utils/newApiMetricFlags'
import type { MetricName } from 'domains/reporting/hooks/metricNames'

export function useGetNewStatsFeatureFlagMigration(metricName: MetricName): {
    stage: MigrationStage
    isLoading: boolean
} {
    const flagName = resolveMetricFlag(metricName)
    const { migrationStage, isLoading } = useGetFeatureFlagMigration(
        flagName,
        'off',
    )

    return { stage: migrationStage, isLoading }
}
