import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {HelpdeskMessageMeasure, TicketDimension} from 'models/reporting/types'
import {useTicketsRepliedMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {TicketsRepliedCellContent} from 'pages/stats/TicketsRepliedCellContent'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metricsPerDimension')
const useTicketsRepliedMetricPerAgentMock = assumeMock(
    useTicketsRepliedMetricPerAgent
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<TicketsRepliedCellContent>', () => {
    const agentId = 123
    const ticketsRepliedValue = 1234

    const defaultState = {
        stats: initialState,
    } as RootState

    const useTicketsRepliedMetricPerAgentReturnValue = {
        data: {
            value: ticketsRepliedValue,
            allData: [
                {
                    [HelpdeskMessageMeasure.TicketCount]: ticketsRepliedValue,
                    [TicketDimension.AssigneeUserId]: agentId,
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    useTicketsRepliedMetricPerAgentMock.mockReturnValue(
        useTicketsRepliedMetricPerAgentReturnValue
    )

    it('should render value as duration', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketsRepliedCellContent agentId={agentId} />
            </Provider>
        )

        expect(screen.getByText(ticketsRepliedValue)).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useTicketsRepliedMetricPerAgentMock.mockReturnValue({
            ...useTicketsRepliedMetricPerAgentReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketsRepliedCellContent agentId={agentId} />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
