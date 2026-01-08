import { FeatureFlagKey } from '@repo/feature-flags'
import type { MigrationStage } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'

import { useGetFeatureFlagMigration } from 'core/flags/hooks/useGetFeatureFlagMigration'
import { resolveMetricFlag } from 'core/flags/utils/newApiMetricFlags'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

jest.mock('core/flags/hooks/useGetFeatureFlagMigration')
jest.mock('core/flags/utils/newApiMetricFlags')

const useGetFeatureFlagMigrationMocked = assumeMock(useGetFeatureFlagMigration)
const resolveMetricFlagMocked = assumeMock(resolveMetricFlag)

describe('useGetNewStatsFeatureFlagMigration', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should resolve the metric flag and return the migration stage', () => {
        const metricName = METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED
        const expectedFlag = FeatureFlagKey.ReportingP1MetricMigration
        const expectedMigrationStage: MigrationStage = 'shadow'

        resolveMetricFlagMocked.mockReturnValue(expectedFlag)
        useGetFeatureFlagMigrationMocked.mockReturnValue(expectedMigrationStage)

        const { result } = renderHook(() =>
            useGetNewStatsFeatureFlagMigration(metricName),
        )

        expect(resolveMetricFlagMocked).toHaveBeenCalledWith(metricName)
        expect(useGetFeatureFlagMigrationMocked).toHaveBeenCalledWith(
            expectedFlag,
            'off',
        )
        expect(result.current).toBe(expectedMigrationStage)
    })

    it('should use "off" as default value when calling useGetFeatureFlagMigration', () => {
        const metricName = METRIC_NAMES.TICKET_INSIGHTS_TAGGED_TICKET_COUNT
        const expectedFlag = FeatureFlagKey.ReportingUnsortedMetricMigration
        const expectedMigrationStage: MigrationStage = 'off'

        resolveMetricFlagMocked.mockReturnValue(expectedFlag)
        useGetFeatureFlagMigrationMocked.mockReturnValue(expectedMigrationStage)

        const { result } = renderHook(() =>
            useGetNewStatsFeatureFlagMigration(metricName),
        )

        expect(useGetFeatureFlagMigrationMocked).toHaveBeenCalledWith(
            expectedFlag,
            'off',
        )
        expect(result.current).toBe(expectedMigrationStage)
    })

    it('should return different migration stages based on the resolved flag', () => {
        const metricName = METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED
        const expectedFlag = FeatureFlagKey.ReportingP1MetricMigration
        const expectedMigrationStage: MigrationStage = 'live'

        resolveMetricFlagMocked.mockReturnValue(expectedFlag)
        useGetFeatureFlagMigrationMocked.mockReturnValue(expectedMigrationStage)

        const { result } = renderHook(() =>
            useGetNewStatsFeatureFlagMigration(metricName),
        )

        expect(result.current).toBe('live')
        expect(useGetFeatureFlagMigrationMocked).toHaveBeenCalledWith(
            expectedFlag,
            'off',
        )
    })
})
