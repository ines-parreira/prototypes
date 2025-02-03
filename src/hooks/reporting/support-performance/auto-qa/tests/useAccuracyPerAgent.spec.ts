import {renderHook} from '@testing-library/react-hooks'

import moment from 'moment'

import {
    fetchAccuracyPerAgent,
    useAccuracyPerAgent,
} from 'hooks/reporting/support-performance/auto-qa/useAccuracyPerAgent'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import {accuracyPerAgentQueryFactory} from 'models/reporting/queryFactories/auto-qa/accuracyQueryFactory'

import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)

describe('AccuracyPerAgent', () => {
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

    describe('useAccuracyPerAgent', () => {
        it('should call perDimension hook with agent id', () => {
            renderHook(() =>
                useAccuracyPerAgent(statsFilters, timezone, undefined, agentId)
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                accuracyPerAgentQueryFactory(statsFilters, timezone, undefined),
                agentId
            )
        })
    })

    describe('fetchAccuracyPerAgent', () => {
        it('should call perDimension hook with agent id', async () => {
            await fetchAccuracyPerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId
            )

            expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                accuracyPerAgentQueryFactory(statsFilters, timezone, undefined),
                agentId
            )
        })
    })
})
