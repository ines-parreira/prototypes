import moment from 'moment'

import {
    fetchBrandVoicePerAgent,
    useBrandVoicePerAgent,
} from 'hooks/reporting/support-performance/auto-qa/useBrandVoicePerAgent'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { brandVoicePerAgentQueryFactory } from 'models/reporting/queryFactories/auto-qa/brandVoiceQueryFactory'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)

describe('BrandVoicePerAgent', () => {
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
    describe('useBrandVoicePerAgent', () => {
        it('should call perDimension hook with agent id', () => {
            renderHook(() =>
                useBrandVoicePerAgent(
                    statsFilters,
                    timezone,
                    undefined,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                brandVoicePerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                agentId,
            )
        })
    })

    describe('useMetricPerDimension', () => {
        it('should call perDimension hook with agent id', async () => {
            await fetchBrandVoicePerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId,
            )

            expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                brandVoicePerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                agentId,
            )
        })
    })
})
