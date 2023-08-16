import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {useClosedTicketsMetric} from 'hooks/reporting/metrics'
import {ClosedTicketsCellSummary} from 'pages/stats/ClosedTicketsCellSummary'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'
import {agents} from 'fixtures/agents'
import {
    getCleanStatsFiltersWithTimezone,
    getSortedAgents,
} from 'state/ui/stats/agentPerformanceSlice'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metrics')
jest.mock('state/ui/stats/agentPerformanceSlice')
const getSortedAgentsMock = assumeMock(getSortedAgents)
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone
)
const useClosedTicketsMetricMock = assumeMock(useClosedTicketsMetric)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<ClosedTicketsCellSummary>', () => {
    const closedTicketsValue = 1234

    const defaultState = {
        stats: initialState,
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    const useClosedTicketsMetricMockReturnValue = {
        data: {
            value: closedTicketsValue,
        },
        isFetching: false,
        isError: false,
    }

    useClosedTicketsMetricMock.mockReturnValue(
        useClosedTicketsMetricMockReturnValue
    )
    getSortedAgentsMock.mockReturnValue(agents)
    getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
        userTimezone: 'someTimezone',
        cleanStatsFilters: {
            period: {
                start_datetime: '1970-01-01T00:00:00+00:00',
                end_datetime: '1970-01-01T00:00:00+00:00',
            },
        },
    })

    it('should render value as decimal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <ClosedTicketsCellSummary />
            </Provider>
        )

        const value = closedTicketsValue / agents.length

        expect(
            screen.getByText(
                formatMetricValue(value, 'decimal', NOT_AVAILABLE_PLACEHOLDER)
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useClosedTicketsMetricMock.mockReturnValue({
            ...useClosedTicketsMetricMockReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <ClosedTicketsCellSummary />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
