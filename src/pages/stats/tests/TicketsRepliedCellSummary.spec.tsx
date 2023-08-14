import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {useTicketsRepliedMetric} from 'hooks/reporting/metrics'
import {TicketsRepliedCellSummary} from 'pages/stats/TicketsRepliedCellSummary'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'
import {agents} from 'fixtures/agents'
import {getSortedAgents} from 'state/ui/stats/agentPerformanceSlice'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metrics')
jest.mock('state/ui/stats/agentPerformanceSlice')
const getSortedAgentsMock = assumeMock(getSortedAgents)
const useTicketsRepliedMetricMock = assumeMock(useTicketsRepliedMetric)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<TicketsRepliedCellSummary>', () => {
    const ticketsRepliedValue = 1234

    const defaultState = {
        stats: initialState,
    } as RootState

    const useTicketsRepliedMetricReturnValue = {
        data: {
            value: ticketsRepliedValue,
        },
        isFetching: false,
        isError: false,
    }

    useTicketsRepliedMetricMock.mockReturnValue(
        useTicketsRepliedMetricReturnValue
    )
    getSortedAgentsMock.mockReturnValue(agents)

    it('should render value as decimal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketsRepliedCellSummary />
            </Provider>
        )

        const value = ticketsRepliedValue / agents.length

        expect(
            screen.getByText(
                formatMetricValue(value, 'decimal', NOT_AVAILABLE_PLACEHOLDER)
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useTicketsRepliedMetricMock.mockReturnValue({
            ...useTicketsRepliedMetricReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketsRepliedCellSummary />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
