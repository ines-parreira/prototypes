import {screen} from '@testing-library/react'

import React from 'react'

import {useAverageScoreTrend} from 'hooks/reporting/quality-management/satisfaction/useAverageScoreTrend'
import {TREND_BADGE_FORMAT} from 'pages/stats/common/components/TrendBadge'
import {formatMetricTrend, formatMetricValue} from 'pages/stats/common/utils'
import {AverageScoreTrendCard} from 'pages/stats/quality-management/satisfaction/AverageScoreTrendCard'
import {SatisfactionMetricConfig} from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import {RootState} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'
import {SatisfactionMetric} from 'state/ui/stats/types'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock(
    'hooks/reporting/quality-management/satisfaction/useAverageScoreTrend'
)
const useAverageScoreTrendMock = assumeMock(useAverageScoreTrend)

describe('AverageScoreTrendCard', () => {
    const defaultState = {
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
            },
        },
        ui: {
            stats: {filters: uiStatsInitialState},
        },
    } as RootState
    const value = 5
    const prevValue = 10

    beforeEach(() => {
        useAverageScoreTrendMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: {
                value,
                prevValue,
            },
        })
    })

    it('should render AverageScoreTrendCard Trend', () => {
        renderWithStore(<AverageScoreTrendCard />, defaultState)

        expect(
            screen.getByText(
                formatMetricValue(
                    value,
                    SatisfactionMetricConfig[SatisfactionMetric.AverageScore]
                        .metricFormat
                )
            )
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                String(
                    formatMetricTrend(value, prevValue, TREND_BADGE_FORMAT)
                        .formattedTrend
                )
            )
        ).toBeInTheDocument()
    })
})
