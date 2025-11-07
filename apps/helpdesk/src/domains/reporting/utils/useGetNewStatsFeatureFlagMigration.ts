import { useGetFeatureFlagMigration } from 'core/flags/hooks/useGetFeatureFlagMigration'
import { resolveMetricFlag } from 'core/flags/utils/newApiMetricFlags'
import { MigrationStage } from 'core/flags/utils/readMigration'
import { MetricName } from 'domains/reporting/hooks/metricNames'

/**
 *
 * @param metricName - The name of the metric to check the feature flag for
 * @returns The migration stage for the metric
 */
export function useGetNewStatsFeatureFlagMigration(
    metricName: MetricName,
): MigrationStage {
    const flagName = resolveMetricFlag(metricName)
    const migrationStage = useGetFeatureFlagMigration(flagName, 'off')

    return migrationStage
}
