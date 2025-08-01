import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useTicketSlaAchievementRateTrend } from 'domains/reporting/hooks/sla/useTicketSlaAchievementRate'
import { TREND_BADGE_FORMAT } from 'domains/reporting/pages/common/components/TrendBadge'
import {
    formatMetricTrend,
    formatMetricValue,
} from 'domains/reporting/pages/common/utils'
import { AchievementRateTrendCard } from 'domains/reporting/pages/sla/components/AchievementRateTrendCard'
import { SlaMetricConfig } from 'domains/reporting/pages/sla/SlaConfig'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { SlaMetric } from 'domains/reporting/state/ui/stats/types'
import { RootState } from 'state/types'

jest.mock('domains/reporting/hooks/sla/useTicketSlaAchievementRate')
const useTicketSlaAchievementRateTrendMock = assumeMock(
    useTicketSlaAchievementRateTrend,
)

const mockStore = configureMockStore([thunk])

describe('AchievementRateTrendCard', () => {
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
        useTicketSlaAchievementRateTrendMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: {
                value,
                prevValue,
            },
        })
    })

    it('should render Achievement Rate Trend', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <AchievementRateTrendCard />
            </Provider>,
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    value,
                    SlaMetricConfig[SlaMetric.AchievementRate].metricFormat,
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
