import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'

import {assumeMock} from 'utils/testing'
import {useVoiceAgentsSummaryMetrics} from 'pages/stats/voice/hooks/useVoiceAgentsSummaryMetrics'
import useAppSelector from 'hooks/useAppSelector'
import {
    useAnsweredCallsMetric,
    useAverageTalkTimeMetric,
    useDeclinedCallsMetric,
    useMissedCallsMetric,
    useOutboundCallsMetric,
    useTotalCallsMetric,
} from 'pages/stats/voice/hooks/agentMetrics'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock('pages/stats/voice/hooks/agentMetrics')
const useTotalCallsMetricMock = assumeMock(useTotalCallsMetric)
const useAnsweredCallsMetricMock = assumeMock(useAnsweredCallsMetric)
const useMissedCallsMetricMock = assumeMock(useMissedCallsMetric)
const useDeclinedCallsMetricMock = assumeMock(useDeclinedCallsMetric)
const useOutboundCallsMetricMock = assumeMock(useOutboundCallsMetric)
const useAverageTalkTimeMetricMock = assumeMock(useAverageTalkTimeMetric)

describe('useVoiceAgentsSummaryMetrics', () => {
    const metricData = {
        isFetching: false,
        isError: false,
        data: {
            value: 2,
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

    it('should return agents performance summary metrics', () => {
        useAppSelectorMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone,
        })
        useTotalCallsMetricMock.mockReturnValue(metricData)
        useAnsweredCallsMetricMock.mockReturnValue(metricData)
        useMissedCallsMetricMock.mockReturnValue(metricData)
        useDeclinedCallsMetricMock.mockReturnValue(metricData)
        useOutboundCallsMetricMock.mockReturnValue(metricData)
        useAverageTalkTimeMetricMock.mockReturnValue(metricData)

        const {result} = renderHook(() => useVoiceAgentsSummaryMetrics())

        expect(result.current).toEqual({
            summaryData: {
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

        expect(useTotalCallsMetricMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
        expect(useAnsweredCallsMetricMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
        expect(useMissedCallsMetricMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
        expect(useDeclinedCallsMetricMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
        expect(useOutboundCallsMetricMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
        expect(useAverageTalkTimeMetricMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
    })
})
