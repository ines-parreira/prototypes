import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {assumeMock} from 'utils/testing'
import {useVoiceAgentsMetrics} from 'pages/stats/voice/hooks/useVoiceAgentsMetrics'
import {
    useAnsweredCallsMetricPerAgent,
    useAverageTalkTimeMetricPerAgent,
    useDeclinedCallsMetricPerAgent,
    useMissedCallsMetricPerAgent,
    useOutboundCallsMetricPerAgent,
    useTotalCallsMetricPerAgent,
} from 'pages/stats/voice/hooks/metricsPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {FeatureFlagKey} from 'config/featureFlags'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock('pages/stats/voice/hooks/metricsPerDimension')
const useTotalCallsMetricPerAgentMock = assumeMock(useTotalCallsMetricPerAgent)
const useAnsweredCallsMetricPerAgentMock = assumeMock(
    useAnsweredCallsMetricPerAgent
)
const useMissedCallsMetricPerAgentMock = assumeMock(
    useMissedCallsMetricPerAgent
)
const useDeclinedCallsMetricPerAgentMock = assumeMock(
    useDeclinedCallsMetricPerAgent
)
const useOutboundCallsMetricPerAgentMock = assumeMock(
    useOutboundCallsMetricPerAgent
)
const useAverageTalkTimeMetricPerAgentMock = assumeMock(
    useAverageTalkTimeMetricPerAgent
)

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>
const agents = [{name: 'Guybrush Threepwood'}]
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
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsNewFiltersVoice]: false,
        })
        useAppSelectorMock
            .mockReturnValueOnce({
                cleanStatsFilters: statsFilters,
                userTimezone,
            })
            .mockReturnValue(agents)
        useTotalCallsMetricPerAgentMock.mockReturnValue(metricData)
        useAnsweredCallsMetricPerAgentMock.mockReturnValue(metricData)
        useMissedCallsMetricPerAgentMock.mockReturnValue(metricData)
        useDeclinedCallsMetricPerAgentMock.mockReturnValue(metricData)
        useOutboundCallsMetricPerAgentMock.mockReturnValue(metricData)
        useAverageTalkTimeMetricPerAgentMock.mockReturnValue(metricData)

        const {result} = renderHook(() => useVoiceAgentsMetrics())

        expect(result.current).toEqual({
            reportData: {
                agents: agents,
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
            userTimezone
        )
        expect(useAnsweredCallsMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
        expect(useMissedCallsMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
        expect(useDeclinedCallsMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
        expect(useOutboundCallsMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
        expect(useAverageTalkTimeMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
    })
})

describe('useVoiceAgentsMetric with the new filters', () => {
    it('should return call activity per agent metrics', () => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsNewFiltersVoice]: true,
        })
        useAppSelectorMock
            .mockReturnValueOnce({
                cleanStatsFilters: statsFilters,
                userTimezone,
            })
            .mockReturnValueOnce({
                cleanStatsFilters: statsFilters,
            })
            .mockReturnValue(agents)
        useTotalCallsMetricPerAgentMock.mockReturnValue(metricData)
        useAnsweredCallsMetricPerAgentMock.mockReturnValue(metricData)
        useMissedCallsMetricPerAgentMock.mockReturnValue(metricData)
        useDeclinedCallsMetricPerAgentMock.mockReturnValue(metricData)
        useOutboundCallsMetricPerAgentMock.mockReturnValue(metricData)
        useAverageTalkTimeMetricPerAgentMock.mockReturnValue(metricData)

        const {result} = renderHook(() => useVoiceAgentsMetrics())

        expect(result.current).toEqual({
            reportData: {
                agents: agents,
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
            userTimezone
        )
        expect(useAnsweredCallsMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
        expect(useMissedCallsMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
        expect(useDeclinedCallsMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
        expect(useOutboundCallsMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
        expect(useAverageTalkTimeMetricPerAgentMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone
        )
    })
})
