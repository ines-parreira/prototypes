import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {useOnlineTimePerAgent} from 'hooks/reporting/metricsPerAgent'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {OnlineTimeCellContent} from 'pages/stats/OnlineTimeCellContent'
import {initialState} from 'state/stats/statsSlice'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'
import {User} from 'config/types/user'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metricsPerAgent')
const useOnlineTimePerAgentMock = assumeMock(useOnlineTimePerAgent)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<OnlineTimeCellContent>', () => {
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

    const useOnlineTimePerAgentMockReturnValue = {
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

    useOnlineTimePerAgentMock.mockReturnValue(
        useOnlineTimePerAgentMockReturnValue
    )

    it('should render value as duration', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <OnlineTimeCellContent agent={agent} />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    closedTicketsValue,
                    'duration',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useOnlineTimePerAgentMock.mockReturnValue({
            ...useOnlineTimePerAgentMockReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <OnlineTimeCellContent agent={agent} />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })

    it('should render heatmap', () => {
        const state = {
            ...defaultState,
            ui: {
                ...defaultState.ui,
                agentPerformance: {
                    ...agentPerformanceInitialState,
                    heatmapMode: true,
                },
            },
        } as RootState
        useOnlineTimePerAgentMock.mockReturnValue({
            ...useOnlineTimePerAgentMockReturnValue,
            data: null,
            isFetching: false,
        })
        render(
            <Provider store={mockStore(state)}>
                <OnlineTimeCellContent agent={agent} />
            </Provider>
        )

        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })
})
