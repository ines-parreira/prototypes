import React from 'react'

import { renderHook } from '@repo/testing'
import { Provider } from 'react-redux'

import { useAverageScoreTrend } from 'domains/reporting/hooks/quality-management/satisfaction/useAverageScoreTrend'
import { useResponseRateTrend } from 'domains/reporting/hooks/quality-management/satisfaction/useResponseRateTrend'
import { useSatisfactionMetrics } from 'domains/reporting/hooks/quality-management/satisfaction/useSatisfactionMetrics'
import { useSatisfactionScoreTrend } from 'domains/reporting/hooks/quality-management/satisfaction/useSatisfactionScoreTrend'
import { useSurveyScores } from 'domains/reporting/hooks/quality-management/satisfaction/useSurveyScores'
import { useSurveysSentTrend } from 'domains/reporting/hooks/quality-management/satisfaction/useSurveysSentTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { TicketSatisfactionSurveyDimension } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import { assumeMock, mockStore } from 'utils/testing'

jest.mock(
    'domains/reporting/hooks/quality-management/satisfaction/useSatisfactionScoreTrend',
)
const useSatisfactionScoreTrendMock = assumeMock(useSatisfactionScoreTrend)

jest.mock(
    'domains/reporting/hooks/quality-management/satisfaction/useResponseRateTrend',
)
const useResponseRateTrendMock = assumeMock(useResponseRateTrend)

jest.mock(
    'domains/reporting/hooks/quality-management/satisfaction/useSurveysSentTrend',
)
const useSurveysSentTrendMock = assumeMock(useSurveysSentTrend)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useNewStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock(
    'domains/reporting/hooks/quality-management/satisfaction/useAverageScoreTrend',
)
const useAverageScoreTrendMock = assumeMock(useAverageScoreTrend)

jest.mock(
    'domains/reporting/hooks/quality-management/satisfaction/useSurveyScores',
)
const useSurveyScoresMock = assumeMock(useSurveyScores)

describe('useSatisfactionMetrics', () => {
    const someTrendData: MetricTrend = {
        data: {
            value: 123,
            prevValue: 456,
        },
        isFetching: false,
        isError: false,
    }

    const surveyScoreData = {
        isFetching: false,
        isError: false,
        data: {
            value: null,
            decile: null,
            allData: [
                { [TicketSatisfactionSurveyDimension.SurveyScore]: '1' },
                { [TicketSatisfactionSurveyDimension.SurveyScore]: '2' },
                { [TicketSatisfactionSurveyDimension.SurveyScore]: '3' },
                { [TicketSatisfactionSurveyDimension.SurveyScore]: '4' },
                { [TicketSatisfactionSurveyDimension.SurveyScore]: '5' },
            ],
        },
    }

    const defaultState = {
        stats: initialState,
    }
    useSatisfactionScoreTrendMock.mockReturnValue(someTrendData)
    useResponseRateTrendMock.mockReturnValue(someTrendData)
    useSurveysSentTrendMock.mockReturnValue(someTrendData)
    useAverageScoreTrendMock.mockReturnValue(someTrendData)
    useSurveyScoresMock.mockReturnValue(surveyScoreData)

    useNewStatsFiltersMock.mockReturnValue({
        cleanStatsFilters: initialState.filters,
        userTimezone: 'UTC',
        granularity: ReportingGranularity.Day,
    })

    it('should return data from all hooks', () => {
        const { result } = renderHook(() => useSatisfactionMetrics(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            reportData: {
                satisfactionScoreTrend: someTrendData,
                responseRateTrend: someTrendData,
                surveysSentTrend: someTrendData,
                averageScoreTrend: someTrendData,
                surveyScores: surveyScoreData,
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
        useResponseRateTrendMock.mockReturnValue(loadingTrendData)

        const { result } = renderHook(() => useSatisfactionMetrics(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            reportData: {
                satisfactionScoreTrend: someTrendData,
                responseRateTrend: loadingTrendData,
                surveysSentTrend: someTrendData,
                averageScoreTrend: someTrendData,
                surveyScores: surveyScoreData,
            },
            isLoading: true,
            period: initialState.filters.period,
        })
    })
})
