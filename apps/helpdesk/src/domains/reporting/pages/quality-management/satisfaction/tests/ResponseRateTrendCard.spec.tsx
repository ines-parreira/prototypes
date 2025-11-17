import React from 'react'

import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useResponseRateTrend } from 'domains/reporting/hooks/quality-management/satisfaction/useResponseRateTrend'
import { TREND_BADGE_FORMAT } from 'domains/reporting/pages/common/components/TrendBadge'
import {
    formatMetricTrend,
    formatMetricValue,
} from 'domains/reporting/pages/common/utils'
import { ResponseRateTrendCard } from 'domains/reporting/pages/quality-management/satisfaction/ResponseRateTrendCard'
import { SatisfactionMetricConfig } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionMetricsConfig'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { SatisfactionMetric } from 'domains/reporting/state/ui/stats/types'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock(
    'domains/reporting/hooks/quality-management/satisfaction/useResponseRateTrend',
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
