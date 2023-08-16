import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {useMessagesSentMetric} from 'hooks/reporting/metrics'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {MessagesSentCellSummary} from 'pages/stats/MessagesSentCellSummary'
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
const useMessagesSentMetricMock = assumeMock(useMessagesSentMetric)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<MessagesSentCellSummary>', () => {
    const messagesSentValue = 1234

    const defaultState = {
        stats: initialState,
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    const useMessagesSentMetricReturnValue = {
        data: {
            value: messagesSentValue,
        },
        isFetching: false,
        isError: false,
    }

    useMessagesSentMetricMock.mockReturnValue(useMessagesSentMetricReturnValue)
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
                <MessagesSentCellSummary />
            </Provider>
        )

        const value = messagesSentValue / agents.length

        expect(
            screen.getByText(
                formatMetricValue(value, 'decimal', NOT_AVAILABLE_PLACEHOLDER)
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useMessagesSentMetricMock.mockReturnValue({
            ...useMessagesSentMetricReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <MessagesSentCellSummary />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
