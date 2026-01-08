import { FeatureFlagKey, fetchFlag } from '@repo/feature-flags'
import type { MigrationStage } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'

import { resolveMetricFlag } from 'core/flags/utils/newApiMetricFlags'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    fetchFlag: jest.fn(),
}))

jest.mock('core/flags/utils/newApiMetricFlags')

const fetchFlagMocked = assumeMock(fetchFlag)
const resolveMetricFlagMocked = assumeMock(resolveMetricFlag)

describe('getNewStatsFeatureFlagMigration', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should resolve the metric flag and return the migration stage', async () => {
        const metricName = METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED
        const expectedFlag = FeatureFlagKey.ReportingP1MetricMigration
        const expectedMigrationStage: MigrationStage = 'shadow'

        resolveMetricFlagMocked.mockReturnValue(expectedFlag)
        fetchFlagMocked.mockResolvedValue({
            flag: expectedMigrationStage,
            error: null,
        })

        const result = await getNewStatsFeatureFlagMigration(metricName)

        expect(resolveMetricFlagMocked).toHaveBeenCalledWith(metricName)
        expect(fetchFlagMocked).toHaveBeenCalledWith(expectedFlag, 'off')
        expect(result).toBe(expectedMigrationStage)
    })

    it('should use "off" as default value when calling fetchFlag', async () => {
        const metricName = METRIC_NAMES.TICKET_INSIGHTS_TAGGED_TICKET_COUNT
        const expectedFlag = FeatureFlagKey.ReportingUnsortedMetricMigration
        const expectedMigrationStage: MigrationStage = 'off'

        resolveMetricFlagMocked.mockReturnValue(expectedFlag)
        fetchFlagMocked.mockResolvedValue({
            flag: expectedMigrationStage,
            error: null,
        })

        const result = await getNewStatsFeatureFlagMigration(metricName)

        expect(fetchFlagMocked).toHaveBeenCalledWith(expectedFlag, 'off')
        expect(result).toBe(expectedMigrationStage)
    })

    it('should return the flag value even when fetchFlag returns an error', async () => {
        const metricName = METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED
        const expectedFlag = FeatureFlagKey.ReportingP1MetricMigration
        const expectedMigrationStage: MigrationStage = 'off'
        const error = new Error('Failed to fetch flag')

        resolveMetricFlagMocked.mockReturnValue(expectedFlag)
        fetchFlagMocked.mockResolvedValue({
            flag: expectedMigrationStage,
            error,
        })

        const result = await getNewStatsFeatureFlagMigration(metricName)

        expect(result).toBe(expectedMigrationStage)
    })

    it('should return different migration stages based on the resolved flag', async () => {
        const metricName = METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED
        const expectedFlag = FeatureFlagKey.ReportingP1MetricMigration
        const expectedMigrationStage: MigrationStage = 'live'

        resolveMetricFlagMocked.mockReturnValue(expectedFlag)
        fetchFlagMocked.mockResolvedValue({
            flag: expectedMigrationStage,
            error: null,
        })

        const result = await getNewStatsFeatureFlagMigration(metricName)

        expect(result).toBe(expectedMigrationStage)
    })
})
