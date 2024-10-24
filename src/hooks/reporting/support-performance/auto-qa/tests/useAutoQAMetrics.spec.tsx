import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {Provider} from 'react-redux'

import {agents} from 'fixtures/agents'
import {useAutoQAMetrics} from 'hooks/reporting/support-performance/auto-qa/useAutoQAMetrics'
import {useCommunicationSkillsPerAgent} from 'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsPerAgent'
import {useCommunicationSkillsTrend} from 'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsTrend'
import {useResolutionCompletenessPerAgent} from 'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessPerAgent'
import {useResolutionCompletenessTrend} from 'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessTrend'
import {useReviewedClosedTicketsPerAgent} from 'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsPerAgent'
import {useReviewedClosedTicketsTrend} from 'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsTrend'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {ReportingGranularity} from 'models/reporting/types'
import {initialState} from 'state/stats/statsSlice'
import {getSortedAutoQAAgents} from 'state/ui/stats/autoQAAgentPerformanceSlice'
import {assumeMock, mockStore} from 'utils/testing'

jest.mock(
    'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsPerAgent'
)
const useCommunicationSkillsPerAgentMock = assumeMock(
    useCommunicationSkillsPerAgent
)
jest.mock(
    'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsTrend'
)
const useCommunicationSkillsTrendMock = assumeMock(useCommunicationSkillsTrend)
jest.mock(
    'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessPerAgent'
)
const useResolutionCompletenessPerAgentMock = assumeMock(
    useResolutionCompletenessPerAgent
)
jest.mock(
    'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessTrend'
)
const useResolutionCompletenessTrendMock = assumeMock(
    useResolutionCompletenessTrend
)
jest.mock(
    'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsPerAgent'
)
const useReviewedClosedTicketsPerAgentMock = assumeMock(
    useReviewedClosedTicketsPerAgent
)
jest.mock(
    'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsTrend'
)
const useReviewedClosedTicketsTrendMock = assumeMock(
    useReviewedClosedTicketsTrend
)
jest.mock('state/ui/stats/autoQAAgentPerformanceSlice')
const getSortedAutoQAAgentsMock = assumeMock(getSortedAutoQAAgents)
jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

describe('useAutoQAMetrics', () => {
    const someTrendData: MetricTrend = {
        data: {
            value: 123,
            prevValue: 456,
        },
        isFetching: false,
        isError: false,
    }
    const someMetricData: MetricWithDecile = {
        isFetching: false,
        isError: false,
        data: {
            value: 123,
            decile: 3,
            allData: [],
        },
    }
    const defaultState = {
        stats: initialState,
    }
    useCommunicationSkillsPerAgentMock.mockReturnValue(someMetricData)
    useCommunicationSkillsTrendMock.mockReturnValue(someTrendData)
    useResolutionCompletenessPerAgentMock.mockReturnValue(someMetricData)
    useResolutionCompletenessTrendMock.mockReturnValue(someTrendData)
    useReviewedClosedTicketsPerAgentMock.mockReturnValue(someMetricData)
    useReviewedClosedTicketsTrendMock.mockReturnValue(someTrendData)
    useNewStatsFiltersMock.mockReturnValue({
        cleanStatsFilters: initialState.filters,
        userTimezone: 'UTC',
        granularity: ReportingGranularity.Day,
        isAnalyticsNewFilters: false,
    })
    getSortedAutoQAAgentsMock.mockReturnValue(agents)

    it('should return data from all hooks and a list of agents', () => {
        const {result} = renderHook(() => useAutoQAMetrics(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            reportData: {
                agents,
                communicationSkillsPerAgent: someMetricData,
                communicationSkillsTrend: someTrendData,
                resolutionCompletenessPerAgent: someMetricData,
                resolutionCompletenessTrend: someTrendData,
                reviewedClosedTicketsPerAgent: someMetricData,
                reviewedClosedTicketsTrend: someTrendData,
            },
            isLoading: false,
            period: initialState.filters.period,
        })
    })

    it('should return isLoading when some of the hooks are still loading', () => {
        const loadingTrendData = {
            data: undefined,
            isFetching: true,
            isError: false,
        }
        useReviewedClosedTicketsTrendMock.mockReturnValue(loadingTrendData)

        const {result} = renderHook(() => useAutoQAMetrics(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            reportData: {
                agents,
                communicationSkillsPerAgent: someMetricData,
                communicationSkillsTrend: someTrendData,
                resolutionCompletenessPerAgent: someMetricData,
                resolutionCompletenessTrend: someTrendData,
                reviewedClosedTicketsPerAgent: someMetricData,
                reviewedClosedTicketsTrend: loadingTrendData,
            },
            isLoading: true,
            period: initialState.filters.period,
        })
    })
})
