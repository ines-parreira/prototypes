import {screen} from '@testing-library/react'
import React from 'react'
import {TrendCardConfig} from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import {useReviewedClosedTicketsTrend} from 'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsTrend'
import {formatMetricTrend, formatMetricValue} from 'pages/stats/common/utils'
import {ReviewedClosedTicketsTrendCard} from 'pages/stats/support-performance/auto-qa/ReviewedClosedTicketsTrendCard'
import {TREND_BADGE_FORMAT} from 'pages/stats/TrendBadge'
import {RootState} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {AutoQAMetric} from 'state/ui/stats/types'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock(
    'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsTrend'
)
const useReviewedClosedTicketsTrendMock = assumeMock(
    useReviewedClosedTicketsTrend
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
            stats: uiStatsInitialState,
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
