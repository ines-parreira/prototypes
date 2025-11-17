import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    useAnsweredCallsMetric,
    useAverageTalkTimeMetric,
    useDeclinedCallsMetric,
    useMissedCallsMetric,
    useOutboundCallsMetric,
    useTotalCallsMetric,
    useTransferredInboundCallsMetric,
} from 'domains/reporting/pages/voice/hooks/agentMetrics'
import { useVoiceAgentsSummaryMetrics } from 'domains/reporting/pages/voice/hooks/useVoiceAgentsSummaryMetrics'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import useAppSelector from 'hooks/useAppSelector'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock('domains/reporting/pages/voice/hooks/agentMetrics')
const useTotalCallsMetricMock = assumeMock(useTotalCallsMetric)
const useAnsweredCallsMetricMock = assumeMock(useAnsweredCallsMetric)
const useMissedCallsMetricMock = assumeMock(useMissedCallsMetric)
const useDeclinedCallsMetricMock = assumeMock(useDeclinedCallsMetric)
const useOutboundCallsMetricMock = assumeMock(useOutboundCallsMetric)
const useAverageTalkTimeMetricMock = assumeMock(useAverageTalkTimeMetric)
const useTransferredInboundCallsMetricMock = assumeMock(
    useTransferredInboundCallsMetric,
)

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

describe('useVoiceAgentsSummaryMetrics', () => {
    it('should return agents performance summary metrics', () => {
        useAppSelectorMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone,
        })
        useTotalCallsMetricMock.mockReturnValue(metricData)
        useAnsweredCallsMetricMock.mockReturnValue(metricData)
        useTransferredInboundCallsMetricMock.mockReturnValue(metricData)
        useMissedCallsMetricMock.mockReturnValue(metricData)
        useDeclinedCallsMetricMock.mockReturnValue(metricData)
        useOutboundCallsMetricMock.mockReturnValue(metricData)
        useAverageTalkTimeMetricMock.mockReturnValue(metricData)

        const { result } = renderHook(() =>
            useVoiceAgentsSummaryMetrics(statsFilters, userTimezone),
        )

        expect(result.current).toEqual({
            summaryData: {
                totalCallsMetric: metricData,
                answeredCallsMetric: metricData,
                transferredInboundCallsMetric: metricData,
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
            userTimezone,
        )
        expect(useAnsweredCallsMetricMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
        expect(useTransferredInboundCallsMetricMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
        expect(useMissedCallsMetricMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
        expect(useDeclinedCallsMetricMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
        expect(useOutboundCallsMetricMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
        expect(useAverageTalkTimeMetricMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
    })
})
