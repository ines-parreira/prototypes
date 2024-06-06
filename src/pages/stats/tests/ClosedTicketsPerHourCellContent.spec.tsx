import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {User} from 'config/types/user'
import {useTicketsClosedPerHourPerAgent} from 'hooks/reporting/useTicketsClosedPerHourPerAgent'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {ClosedTicketsPerHourCellContent} from 'pages/stats/ClosedTicketsPerHourCellContent'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {initialState} from 'state/stats/statsSlice'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useTicketsClosedPerHourPerAgent')
const useTicketsClosedPerHourPerAgentMock = assumeMock(
    useTicketsClosedPerHourPerAgent
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<ClosedTicketsPerHourCellContent>', () => {
    const agent = {
        id: 123,
        name: 'User',
    } as User
    const closedTicketsValue = 1234
    const decile = 5
    const defaultState = {
        stats: initialState,
        ui: {
            agentPerformance: agentPerformanceInitialState,
            stats: uiStatsInitialState,
        },
    } as RootState

    const useTicketsClosedPerHourPerAgentReturnValue = {
        data: {
            value: closedTicketsValue,
            decile,
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

    beforeEach(() => {
        useTicketsClosedPerHourPerAgentMock.mockReturnValue(
            useTicketsClosedPerHourPerAgentReturnValue
        )
    })

    it('should render value as decimal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <ClosedTicketsPerHourCellContent agent={agent} />
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
        useTicketsClosedPerHourPerAgentMock.mockReturnValue({
            ...useTicketsClosedPerHourPerAgentReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <ClosedTicketsPerHourCellContent agent={agent} />
            </Provider>
        )

        expect(document.querySelector('.skeleton')).toBeInTheDocument()
    })

    it('should render heatmap mode', () => {
        const state = {
            stats: initialState,
            ui: {
                agentPerformance: {
                    ...agentPerformanceInitialState,
                    heatmapMode: true,
                },
                stats: uiStatsInitialState,
            },
        } as RootState

        render(
            <Provider store={mockStore(state)}>
                <ClosedTicketsPerHourCellContent agent={agent} />
            </Provider>
        )

        expect(document.querySelector(`.p${decile}`)).toBeInTheDocument()
    })
})
