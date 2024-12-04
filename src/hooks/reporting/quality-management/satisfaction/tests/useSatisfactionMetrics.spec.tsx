import {renderHook} from '@testing-library/react-hooks'

import React from 'react'
import {Provider} from 'react-redux'

import {useSurveysSentTrend} from 'hooks/reporting/quality-management/satisfaction//useSurveysSentTrend'
import {useAverageScoreTrend} from 'hooks/reporting/quality-management/satisfaction/useAverageScoreTrend'
import {useResponseRateTrend} from 'hooks/reporting/quality-management/satisfaction/useResponseRateTrend'
import {useSatisfactionMetrics} from 'hooks/reporting/quality-management/satisfaction/useSatisfactionMetrics'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {ReportingGranularity} from 'models/reporting/types'
import {initialState} from 'state/stats/statsSlice'
import {assumeMock, mockStore} from 'utils/testing'

jest.mock(
    'hooks/reporting/quality-management/satisfaction/useAverageScoreTrend'
)
const useAverageScoreTrendMock = assumeMock(useAverageScoreTrend)

jest.mock(
    'hooks/reporting/quality-management/satisfaction/useResponseRateTrend'
)
const useResponseRateTrendMock = assumeMock(useResponseRateTrend)

jest.mock('hooks/reporting/quality-management/satisfaction/useSurveysSentTrend')
const useSurveysSentTrendMock = assumeMock(useSurveysSentTrend)

jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

describe('useSatisfactionMetrics', () => {
    const someTrendData: MetricTrend = {
        data: {
            value: 123,
            prevValue: 456,
        },
        isFetching: false,
        isError: false,
    }

    const defaultState = {
        stats: initialState,
    }
    useAverageScoreTrendMock.mockReturnValue(someTrendData)
    useResponseRateTrendMock.mockReturnValue(someTrendData)
    useSurveysSentTrendMock.mockReturnValue(someTrendData)

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
                averageScoreTrend: someTrendData,
                responseRateTrend: someTrendData,
                surveysSentTrend: someTrendData,
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
                averageScoreTrend: someTrendData,
                responseRateTrend: loadingTrendData,
                surveysSentTrend: someTrendData,
            },
            isLoading: true,
            period: initialState.filters.period,
        })
    })
})
