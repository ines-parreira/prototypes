import React from 'react'

import { screen } from '@testing-library/react'

import { useResolutionCompletenessTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useResolutionCompletenessTrend'
import { TREND_BADGE_FORMAT } from 'domains/reporting/pages/common/components/TrendBadge'
import {
    formatMetricTrend,
    formatMetricValue,
} from 'domains/reporting/pages/common/utils'
import { TrendCardConfig } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'
import { ResolutionCompletenessTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/ResolutionCompletenessTrendCard'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { AutoQAMetric } from 'domains/reporting/state/ui/stats/types'
import { RootState } from 'state/types'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useResolutionCompletenessTrend',
)
const useResolutionCompletenessTrendMock = assumeMock(
    useResolutionCompletenessTrend,
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
            stats: { filters: uiStatsInitialState },
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
