import React from 'react'

import { screen } from '@testing-library/react'

import { useResponseRateTrend } from 'hooks/reporting/quality-management/satisfaction/useResponseRateTrend'
import { TREND_BADGE_FORMAT } from 'pages/stats/common/components/TrendBadge'
import { formatMetricTrend, formatMetricValue } from 'pages/stats/common/utils'
import { ResponseRateTrendCard } from 'pages/stats/quality-management/satisfaction/ResponseRateTrendCard'
import { SatisfactionMetricConfig } from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import { RootState } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { SatisfactionMetric } from 'state/ui/stats/types'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock(
    'hooks/reporting/quality-management/satisfaction/useResponseRateTrend',
)
const useResponseRateTrendMock = assumeMock(useResponseRateTrend)

describe('ResponseRateTrendCard', () => {
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
            stats: { filters: uiStatsInitialState },
        },
    } as RootState
    const value = 5
    const prevValue = 10

    beforeEach(() => {
        useResponseRateTrendMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: {
                value,
                prevValue,
            },
        })
    })

    it('should render ResponseRateTrendCard Trend', () => {
        renderWithStore(<ResponseRateTrendCard />, defaultState)

        expect(
            screen.getByText(
                formatMetricValue(
                    value,
                    SatisfactionMetricConfig[SatisfactionMetric.ResponseRate]
                        .metricFormat,
                ),
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                String(
                    formatMetricTrend(value, prevValue, TREND_BADGE_FORMAT)
                        .formattedTrend,
                ),
            ),
        ).toBeInTheDocument()
    })
})
