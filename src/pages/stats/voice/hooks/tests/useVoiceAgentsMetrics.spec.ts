import moment from 'moment/moment'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    useAnsweredCallsMetricPerAgent,
    useAverageTalkTimeMetricPerAgent,
    useDeclinedCallsMetricPerAgent,
    useMissedCallsMetricPerAgent,
    useOutboundCallsMetricPerAgent,
    useTotalCallsMetricPerAgent,
} from 'pages/stats/voice/hooks/metricsPerDimension'
import { useVoiceAgentsMetrics } from 'pages/stats/voice/hooks/useVoiceAgentsMetrics'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock('pages/stats/voice/hooks/metricsPerDimension')
const useTotalCallsMetricPerAgentMock = assumeMock(useTotalCallsMetricPerAgent)
const useAnsweredCallsMetricPerAgentMock = assumeMock(
    useAnsweredCallsMetricPerAgent,
)
const useMissedCallsMetricPerAgentMock = assumeMock(
    useMissedCallsMetricPerAgent,
)
const useDeclinedCallsMetricPerAgentMock = assumeMock(
    useDeclinedCallsMetricPerAgent,
)
const useOutboundCallsMetricPerAgentMock = assumeMock(
    useOutboundCallsMetricPerAgent,
)
const useAverageTalkTimeMetricPerAgentMock = assumeMock(
    useAverageTalkTimeMetricPerAgent,
)

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

const agents = [{ name: 'Guybrush Threepwood' }]
const metricData = {
    isFetching: false,
    isError: false,
    data: {
        value: 2,
        decile: 0,
        allData: [],
    },
}
const periodStart = moment()
const periodEnd = periodStart.add(7, 'days')
const statsFilters: StatsFilters = {
    period: {
        end_datetime: formatReportingQueryDate(periodStart),
        start_datetime: formatReportingQueryDate(periodEnd),
    },
}
const userTimezone = 'UTC'

describe('useVoiceAgentsMetric', () => {
    it('should return call activity per agent metrics', () => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
        useAppSelectorMock.mockReturnValue(agents)
        useTotalCallsMetricPerAgentMock.mockReturnValue(metricData)
        useAnsweredCallsMetricPerAgentMock.mockReturnValue(metricData)
        useMissedCallsMetricPerAgentMock.mockReturnValue(metricData)
        useDeclinedCallsMetricPerAgentMock.mockReturnValue(metricData)
        useOutboundCallsMetricPerAgentMock.mockReturnValue(metricData)
        useAverageTalkTimeMetricPerAgentMock.mockReturnValue(metricData)

        const { result } = renderHook(() =>
            useVoiceAgentsMetrics(statsFilters, userTimezone),
        )

        expect(result.current).toEqual({
            reportData: {
                totalCallsMetric: metricData,
                answeredCallsMetric: metricData,
                missedCallsMetric: metricData,
                declinedCallsMetric: metricData,
                outboundCallsMetric: metricData,
                averageTalkTimeMetric: metricData,
            },
            isLoading: false,
            period: {
                end_datetime: formatReportingQueryDate(periodStart),
                start_datetime: formatReportingQueryDate(periodEnd),
            },
        })

        expect(useTotalCallsMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
        expect(useAnsweredCallsMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
        expect(useMissedCallsMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
        expect(useDeclinedCallsMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
        expect(useOutboundCallsMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
        expect(useAverageTalkTimeMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
    })
})
