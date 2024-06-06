import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {TREND_BADGE_FORMAT} from 'pages/stats/TrendBadge'
import {SlaMetricConfig} from 'pages/stats/sla/SlaConfig'
import {formatMetricTrend, formatMetricValue} from 'pages/stats/common/utils'
import {BreachedTicketsRateTrendCard} from 'pages/stats/sla/components/BreachedTicketsRateTrendCard'
import {useBreachedSlaTicketsTrend} from 'hooks/reporting/sla/useSLAsTicketsTrends'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {SlaMetric} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/sla/useSLAsTicketsTrends')
const useBreachedSlaTicketsTrendMock = assumeMock(useBreachedSlaTicketsTrend)

const mockStore = configureMockStore([thunk])

describe('BreachedTicketsRateTrendCard', () => {
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
    }
    const value = 5
    const prevValue = 10

    beforeEach(() => {
        useBreachedSlaTicketsTrendMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: {
                value,
                prevValue,
            },
        })
    })

    it('should render Breached Tickets Rate Trend', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <BreachedTicketsRateTrendCard />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    value,
                    SlaMetricConfig[SlaMetric.BreachedTicketsRate].metricFormat
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
