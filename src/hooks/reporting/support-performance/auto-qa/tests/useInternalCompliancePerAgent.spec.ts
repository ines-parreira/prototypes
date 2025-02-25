import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment'

import {
    fetchInternalCompliancePerAgent,
    useInternalCompliancePerAgent,
} from 'hooks/reporting/support-performance/auto-qa/useInternalCompliancePerAgent'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { internalCompliancePerAgentQueryFactory } from 'models/reporting/queryFactories/auto-qa/internalComplianceQueryFactory'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)

describe('InternalCompliancePerAgent', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const agentId = '123'
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe('useInternalCompliancePerAgent', () => {
        it('should call perDimension hook with agent id', () => {
            renderHook(() =>
                useInternalCompliancePerAgent(
                    statsFilters,
                    timezone,
                    undefined,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                internalCompliancePerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                agentId,
            )
        })
    })

    describe('fetchInternalCompliancePerAgent', () => {
        it('should call perDimension hook with agent id', async () => {
            await fetchInternalCompliancePerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId,
            )

            expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                internalCompliancePerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                agentId,
            )
        })
    })
})
