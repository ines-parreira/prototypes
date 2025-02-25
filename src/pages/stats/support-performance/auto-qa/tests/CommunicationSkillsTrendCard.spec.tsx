import React from 'react'

import { screen } from '@testing-library/react'

import { useCommunicationSkillsTrend } from 'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsTrend'
import { TREND_BADGE_FORMAT } from 'pages/stats/common/components/TrendBadge'
import { formatMetricTrend, formatMetricValue } from 'pages/stats/common/utils'
import { TrendCardConfig } from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import { CommunicationSkillsTrendCard } from 'pages/stats/support-performance/auto-qa/CommunicationSkillsTrendCard'
import { RootState } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { AutoQAMetric } from 'state/ui/stats/types'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock(
    'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsTrend',
)
const useCommunicationSkillsTrendMock = assumeMock(useCommunicationSkillsTrend)

describe('CommunicationSkillsTrendCard', () => {
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
        useCommunicationSkillsTrendMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: {
                value,
                prevValue,
            },
        })
    })

    it('should render CommunicationSkillsTrendCard Trend', () => {
        renderWithStore(<CommunicationSkillsTrendCard />, defaultState)

        expect(
            screen.getByText(
                formatMetricValue(
                    value,
                    TrendCardConfig[AutoQAMetric.CommunicationSkills]
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
