import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'

import useFlag from 'core/flags/hooks/useFlag'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'

import { useNewApiMetricFlags } from '../useNewApiMetricFlags'

jest.mock('core/flags/hooks/useFlag')

const useFlagMocked = assumeMock(useFlag)

describe('useNewApiMetricFlags', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should resolve P1 metric flag and call useFlag with correct parameters', () => {
        const p1Metric = METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED
        const expectedFlag = FeatureFlagKey.ReportingP1MetricMigration
        const expectedMigrationMode = 'shadow'

        useFlagMocked.mockReturnValue(expectedMigrationMode)

        const { result } = renderHook(() => useNewApiMetricFlags(p1Metric))

        expect(useFlagMocked).toHaveBeenCalledWith(expectedFlag, 'off')
        expect(result.current).toBe(expectedMigrationMode)
    })

    it('should resolve P2 metric flag and call useFlag with correct parameters', () => {
        const p2Metric = METRIC_NAMES.TICKET_INSIGHTS_TAGGED_TICKET_COUNT
        const expectedFlag = FeatureFlagKey.ReportingUnsortedMetricMigration
        const expectedMigrationMode = 'off'

        useFlagMocked.mockReturnValue(expectedMigrationMode)

        const { result } = renderHook(() => useNewApiMetricFlags(p2Metric))

        expect(useFlagMocked).toHaveBeenCalledWith(expectedFlag, 'off')
        expect(result.current).toBe(expectedMigrationMode)
    })

    it('should always use "off" as default value for useFlag', () => {
        const testMetric = METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED
        const expectedFlag = FeatureFlagKey.ReportingP1MetricMigration

        useFlagMocked.mockReturnValue('shadow')

        renderHook(() => useNewApiMetricFlags(testMetric))

        expect(useFlagMocked).toHaveBeenCalledWith(expectedFlag, 'off')
    })
})
