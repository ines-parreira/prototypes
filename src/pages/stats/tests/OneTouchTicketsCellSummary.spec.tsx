import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {ReportingGranularity} from 'models/reporting/types'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {useOneTouchTicketsMetric} from 'hooks/reporting/metrics'
import {OneTouchTicketsCellSummary} from 'pages/stats/OneTouchTicketsCellSummary'
import {initialState} from 'state/stats/reducers'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {RootState, StoreDispatch} from 'state/types'
import {
    initialState as agentPerformanceInitialState,
    getSortedAgents,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/agentPerformanceSlice'
import {assumeMock} from 'utils/testing'
import {agents} from 'fixtures/agents'

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
const useOneTouchTicketsMetricMock = assumeMock(useOneTouchTicketsMetric)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<PercentageOfClosedTicketsCellSummary>', () => {
    const allTicketsCount = 100

    const defaultState = {
        stats: initialState,
        ui: {
            agentPerformance: agentPerformanceInitialState,
            stats: uiStatsInitialState,
        },
    } as RootState

    const useOneTouchTicketsMetricMockReturnValue = {
        data: {value: allTicketsCount},
        isFetching: false,
        isError: false,
    }

    useOneTouchTicketsMetricMock.mockReturnValue(
        useOneTouchTicketsMetricMockReturnValue
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
        granularity: ReportingGranularity.Day,
    })

    it('should render value as percentage', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <OneTouchTicketsCellSummary />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    allTicketsCount / agents.length,
                    'percent',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useOneTouchTicketsMetricMock.mockReturnValue({
            ...useOneTouchTicketsMetricMockReturnValue,
            isFetching: true,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <OneTouchTicketsCellSummary />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
