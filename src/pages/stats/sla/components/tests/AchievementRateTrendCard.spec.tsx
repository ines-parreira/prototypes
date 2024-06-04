import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {TREND_BADGE_FORMAT} from 'pages/stats/TrendBadge'
import {SlaMetricConfig} from 'pages/stats/sla/SlaConfig'
import {formatMetricTrend, formatMetricValue} from 'pages/stats/common/utils'
import {StatsFilters} from 'models/stat/types'
import {AchievementRateTrendCard} from 'pages/stats/sla/components/AchievementRateTrendCard'
import {useTicketSlaAchievementRateTrend} from 'hooks/reporting/sla/useTicketSlaAchievementRate'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {SlaMetric} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/sla/useTicketSlaAchievementRate')
const useTicketSlaAchievementRateTrendMock = assumeMock(
    useTicketSlaAchievementRateTrend
)

const mockStore = configureMockStore([thunk])

describe('AchievementRateTrendCard', () => {
    const defaultState = {
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
            } as StatsFilters,
        }),
        ui: {
            stats: uiStatsInitialState,
        },
    }
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
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    value,
                    SlaMetricConfig[SlaMetric.AchievementRate].metricFormat
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
