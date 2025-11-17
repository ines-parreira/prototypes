import React from 'react'

import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useEfficiencyTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useEfficiencyTrend'
import { TREND_BADGE_FORMAT } from 'domains/reporting/pages/common/components/TrendBadge'
import {
    formatMetricTrend,
    formatMetricValue,
} from 'domains/reporting/pages/common/utils'
import { TrendCardConfig } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'
import { EfficiencyTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/EfficiencyTrendCard'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { AutoQAMetric } from 'domains/reporting/state/ui/stats/types'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useEfficiencyTrend',
)
const useEfficiencyTrendMock = assumeMock(useEfficiencyTrend)

describe('EfficiencyTrendCard', () => {
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
        useEfficiencyTrendMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: {
                value,
                prevValue,
            },
        })
    })

    it('should render EfficiencyTrendCard Trend', () => {
        renderWithStore(<EfficiencyTrendCard />, defaultState)

        expect(
            screen.getByText(
                formatMetricValue(
                    value,
                    TrendCardConfig[AutoQAMetric.Efficiency].metricFormat,
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
