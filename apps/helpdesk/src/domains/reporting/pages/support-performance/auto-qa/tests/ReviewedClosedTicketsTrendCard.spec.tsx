import React from 'react'

import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useReviewedClosedTicketsTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useReviewedClosedTicketsTrend'
import { TREND_BADGE_FORMAT } from 'domains/reporting/pages/common/components/TrendBadge'
import {
    formatMetricTrend,
    formatMetricValue,
} from 'domains/reporting/pages/common/utils'
import { TrendCardConfig } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'
import { ReviewedClosedTicketsTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/ReviewedClosedTicketsTrendCard'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { AutoQAMetric } from 'domains/reporting/state/ui/stats/types'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useReviewedClosedTicketsTrend',
)
const useReviewedClosedTicketsTrendMock = assumeMock(
    useReviewedClosedTicketsTrend,
)

describe('NumberOfClosedTicketsReviewedTrendCard', () => {
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
        useReviewedClosedTicketsTrendMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: {
                value,
                prevValue,
            },
        })
    })

    it('should render NumberOfClosedTicketsReviewed Trend', () => {
        renderWithStore(<ReviewedClosedTicketsTrendCard />, defaultState)

        expect(
            screen.getByText(
                formatMetricValue(
                    value,
                    TrendCardConfig[AutoQAMetric.ReviewedClosedTickets]
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
