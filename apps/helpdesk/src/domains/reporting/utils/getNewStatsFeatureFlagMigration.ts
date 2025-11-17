import { fetchFlag } from 'core/flags/fetchFlag'
import { resolveMetricFlag } from 'core/flags/utils/newApiMetricFlags'
import type { MigrationStage } from 'core/flags/utils/readMigration'
import type { MetricName } from 'domains/reporting/hooks/metricNames'

/**
 * @param metricName - The name of the metric to check the feature flag for
 * @returns The migration stage for the metric
 */
export const getNewStatsFeatureFlagMigration = async (
    metricName: MetricName,
): Promise<MigrationStage> => {
    const flagName = resolveMetricFlag(metricName)
    const { flag } = await fetchFlag<MigrationStage>(flagName, 'off')
    return flag
}
