import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {useTicketsRepliedMetricPerAgent} from 'hooks/reporting/metricsPerAgent'
import {TicketsRepliedCellContent} from 'pages/stats/TicketsRepliedCellContent'
import {initialState} from 'state/stats/statsSlice'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'
import {HelpdeskMessageMeasure} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {User} from 'config/types/user'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metricsPerAgent')
const useTicketsRepliedMetricPerAgentMock = assumeMock(
    useTicketsRepliedMetricPerAgent
)

jest.mock('@gorgias/ui-kit', () => ({
    Tooltip: () => <div />,
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<TicketsRepliedCellContent>', () => {
    const agent = {
        id: 123,
        name: 'User',
    } as User
    const ticketsRepliedValue = 1234
    const defaultState = {
        stats: initialState,
        ui: {
            agentPerformance: agentPerformanceInitialState,
            stats: uiStatsInitialState,
        },
    } as RootState

    const useTicketsRepliedMetricPerAgentReturnValue = {
        data: {
            value: ticketsRepliedValue,
            decile: 5,
            allData: [
                {
                    [HelpdeskMessageMeasure.TicketCount]:
                        String(ticketsRepliedValue),
                    [TicketDimension.AssigneeUserId]: String(agent.id),
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
                <TicketsRepliedCellContent agent={agent} />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    ticketsRepliedValue,
                    'decimal',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useTicketsRepliedMetricPerAgentMock.mockReturnValue({
            ...useTicketsRepliedMetricPerAgentReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketsRepliedCellContent agent={agent} />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
