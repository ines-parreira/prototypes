import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useBreachedSlaTicketsTrend } from 'domains/reporting/hooks/sla/useSLAsTicketsTrends'
import { TREND_BADGE_FORMAT } from 'domains/reporting/pages/common/components/TrendBadge'
import {
    formatMetricTrend,
    formatMetricValue,
} from 'domains/reporting/pages/common/utils'
import { BreachedTicketsRateTrendCard } from 'domains/reporting/pages/sla/components/BreachedTicketsRateTrendCard'
import { SlaMetricConfig } from 'domains/reporting/pages/sla/SlaConfig'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { SlaMetric } from 'domains/reporting/state/ui/stats/types'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/sla/useSLAsTicketsTrends')
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
            stats: { filters: uiStatsInitialState },
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
            </Provider>,
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    value,
                    SlaMetricConfig[SlaMetric.BreachedTicketsRate].metricFormat,
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
