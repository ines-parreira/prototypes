import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {useOnlineTimeMetric} from 'hooks/reporting/metrics'
import {OnlineTimeCellSummary} from 'pages/stats/OnlineTimeCellSummary'
import {ReportingGranularity} from 'models/reporting/types'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {assumeMock} from 'utils/testing'
import {agents} from 'fixtures/agents'
import {getSortedAgents} from 'state/ui/stats/agentPerformanceSlice'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone
)
jest.mock('state/ui/stats/agentPerformanceSlice')
const getSortedAgentsMock = assumeMock(getSortedAgents)
jest.mock('hooks/reporting/metrics')
const useOnlineTimeMetricMock = assumeMock(useOnlineTimeMetric)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<OnlineTimeCellSummary>', () => {
    const onlineTimeValue = 1234

    const defaultState = {
        stats: initialState,
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    const useOnlineTimeMetricMockReturnValue = {
        data: {
            value: onlineTimeValue,
        },
        isFetching: false,
        isError: false,
    }

    useOnlineTimeMetricMock.mockReturnValue(useOnlineTimeMetricMockReturnValue)
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

    it('should render value as decimal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <OnlineTimeCellSummary />
            </Provider>
        )

        const value = onlineTimeValue / agents.length

        expect(
            screen.getByText(
                formatMetricValue(value, 'duration', NOT_AVAILABLE_PLACEHOLDER)
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useOnlineTimeMetricMock.mockReturnValue({
            ...useOnlineTimeMetricMockReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <OnlineTimeCellSummary />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })

    it('should render no data placeholder', () => {
        useOnlineTimeMetricMock.mockReturnValue({
            ...useOnlineTimeMetricMockReturnValue,
            data: undefined,
            isFetching: false,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <OnlineTimeCellSummary />
            </Provider>
        )

        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })
})
