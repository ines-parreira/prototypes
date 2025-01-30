import {renderHook} from '@testing-library/react-hooks'

import React from 'react'
import {Provider} from 'react-redux'

import {useAverageScoreTrend} from 'hooks/reporting/quality-management/satisfaction/useAverageScoreTrend'
import {useResponseRateTrend} from 'hooks/reporting/quality-management/satisfaction/useResponseRateTrend'
import {useSatisfactionMetrics} from 'hooks/reporting/quality-management/satisfaction/useSatisfactionMetrics'
import {useSatisfactionScoreTrend} from 'hooks/reporting/quality-management/satisfaction/useSatisfactionScoreTrend'
import {useSurveyScores} from 'hooks/reporting/quality-management/satisfaction/useSurveyScores'
import {useSurveysSentTrend} from 'hooks/reporting/quality-management/satisfaction/useSurveysSentTrend'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {TicketSatisfactionSurveyDimension} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {ReportingGranularity} from 'models/reporting/types'
import {initialState} from 'state/stats/statsSlice'
import {assumeMock, mockStore} from 'utils/testing'

jest.mock(
    'hooks/reporting/quality-management/satisfaction/useSatisfactionScoreTrend'
)
const useSatisfactionScoreTrendMock = assumeMock(useSatisfactionScoreTrend)

jest.mock(
    'hooks/reporting/quality-management/satisfaction/useResponseRateTrend'
)
const useResponseRateTrendMock = assumeMock(useResponseRateTrend)

jest.mock('hooks/reporting/quality-management/satisfaction/useSurveysSentTrend')
const useSurveysSentTrendMock = assumeMock(useSurveysSentTrend)

jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

jest.mock(
    'hooks/reporting/quality-management/satisfaction/useAverageScoreTrend'
)
const useAverageScoreTrendMock = assumeMock(useAverageScoreTrend)

jest.mock('hooks/reporting/quality-management/satisfaction/useSurveyScores')
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
                {[TicketSatisfactionSurveyDimension.SurveyScore]: '1'},
                {[TicketSatisfactionSurveyDimension.SurveyScore]: '2'},
                {[TicketSatisfactionSurveyDimension.SurveyScore]: '3'},
                {[TicketSatisfactionSurveyDimension.SurveyScore]: '4'},
                {[TicketSatisfactionSurveyDimension.SurveyScore]: '5'},
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
        isAnalyticsNewFilters: false,
    })

    it('should return data from all hooks', () => {
        const {result} = renderHook(() => useSatisfactionMetrics(), {
            wrapper: ({children}) => (
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

        const {result} = renderHook(() => useSatisfactionMetrics(), {
            wrapper: ({children}) => (
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
