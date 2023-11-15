import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {useClosedTicketsMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {ClosedTicketsCellContent} from 'pages/stats/ClosedTicketsCellContent'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'
import {TableColumn} from 'state/ui/stats/types'
import {User} from 'config/types/user'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metricsPerDimension')
const useClosedTicketsMetricPerAgentMock = assumeMock(
    useClosedTicketsMetricPerAgent
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<ClosedTicketsCellContent>', () => {
    const agent = {
        id: 123,
        name: 'User',
    } as User
    const closedTicketsValue = 1234

    const defaultState = {
        stats: initialState,
        ui: {
            agentPerformance: agentPerformanceInitialState,
            stats: uiStatsInitialState,
        },
    } as RootState

    const useClosedTicketsMetricPerAgentMockReturnValue = {
        data: {
            value: closedTicketsValue,
            decile: 5,
            allData: [
                {
                    [TicketMeasure.TicketCount]: String(closedTicketsValue),
                    [TicketDimension.AssigneeUserId]: String(agent.id),
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    useClosedTicketsMetricPerAgentMock.mockReturnValue(
        useClosedTicketsMetricPerAgentMockReturnValue
    )

    it('should render value as decimal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <ClosedTicketsCellContent
                    column={TableColumn.ClosedTickets}
                    agent={agent}
                />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    closedTicketsValue,
                    'decimal',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useClosedTicketsMetricPerAgentMock.mockReturnValue({
            ...useClosedTicketsMetricPerAgentMockReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <ClosedTicketsCellContent
                    column={TableColumn.ClosedTickets}
                    agent={agent}
                />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
