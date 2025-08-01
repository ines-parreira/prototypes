import React from 'react'

import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useSurveysSentTrend } from 'domains/reporting/hooks/quality-management/satisfaction/useSurveysSentTrend'
import { TREND_BADGE_FORMAT } from 'domains/reporting/pages/common/components/TrendBadge'
import {
    formatMetricTrend,
    formatMetricValue,
} from 'domains/reporting/pages/common/utils'
import { SatisfactionMetricConfig } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionMetricsConfig'
import { SurveysSentTrendCard } from 'domains/reporting/pages/quality-management/satisfaction/SurveysSentTrendCard'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { SatisfactionMetric } from 'domains/reporting/state/ui/stats/types'
import { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock(
    'domains/reporting/hooks/quality-management/satisfaction/useSurveysSentTrend',
)
const useSurveysSentTrendMock = assumeMock(useSurveysSentTrend)

describe('SurveysSentTrendCard', () => {
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
        useSurveysSentTrendMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: {
                value,
                prevValue,
            },
        })
    })

    it('should render SurveysSentTrendCard Trend', () => {
        renderWithStore(<SurveysSentTrendCard />, defaultState)

        expect(
            screen.getByText(
                formatMetricValue(
                    value,
                    SatisfactionMetricConfig[SatisfactionMetric.SurveysSent]
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
