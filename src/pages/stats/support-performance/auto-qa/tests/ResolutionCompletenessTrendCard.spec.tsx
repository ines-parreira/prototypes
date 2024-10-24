import {screen} from '@testing-library/react'
import React from 'react'

import {useResolutionCompletenessTrend} from 'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessTrend'
import {TREND_BADGE_FORMAT} from 'pages/stats/common/components/TrendBadge'
import {formatMetricTrend, formatMetricValue} from 'pages/stats/common/utils'
import {TrendCardConfig} from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import {ResolutionCompletenessTrendCard} from 'pages/stats/support-performance/auto-qa/ResolutionCompletenessTrendCard'
import {RootState} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/filtersSlice'
import {AutoQAMetric} from 'state/ui/stats/types'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock(
    'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessTrend'
)
const useResolutionCompletenessTrendMock = assumeMock(
    useResolutionCompletenessTrend
)

describe('ResolutionCompletenessTrendCard', () => {
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
        useResolutionCompletenessTrendMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: {
                value,
                prevValue,
            },
        })
    })

    it('should render ResolutionCompletenessTrendCard Trend', () => {
        renderWithStore(<ResolutionCompletenessTrendCard />, defaultState)

        expect(
            screen.getByText(
                formatMetricValue(
                    value,
                    TrendCardConfig[AutoQAMetric.ResolutionCompleteness]
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
