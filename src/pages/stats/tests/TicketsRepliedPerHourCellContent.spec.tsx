import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {User} from 'config/types/user'
import {useTicketsRepliedPerHourPerAgent} from 'hooks/reporting/useTicketsRepliedPerHourPerAgent'
import {HelpdeskMessageDimension} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {TicketsRepliedPerHourCellContent} from 'pages/stats/TicketsRepliedPerHourCellContent'
import {initialState} from 'state/stats/statsSlice'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useTicketsRepliedPerHourPerAgent')
const useTicketsRepliedPerHourPerAgentMock = assumeMock(
    useTicketsRepliedPerHourPerAgent
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<TicketsRepliedPerHourCellContent>', () => {
    const agent = {
        id: 123,
        name: 'User',
    } as User
    const messagesSentValue = 1234
    const decile = 5
    const defaultState = {
        stats: initialState,
        ui: {
            agentPerformance: agentPerformanceInitialState,
            stats: uiStatsInitialState,
        },
    } as RootState

    const useTicketsRepliedPerHourPerAgentReturnValue = {
        data: {
            value: messagesSentValue,
            decile,
            allData: [
                {
                    [TicketMeasure.TicketCount]: String(messagesSentValue),
                    [HelpdeskMessageDimension.SenderId]: String(agent.id),
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        useTicketsRepliedPerHourPerAgentMock.mockReturnValue(
            useTicketsRepliedPerHourPerAgentReturnValue
        )
    })

    it('should render value as decimal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketsRepliedPerHourCellContent agent={agent} />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    messagesSentValue,
                    'decimal',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useTicketsRepliedPerHourPerAgentMock.mockReturnValue({
            ...useTicketsRepliedPerHourPerAgentReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketsRepliedPerHourCellContent agent={agent} />
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
                <TicketsRepliedPerHourCellContent agent={agent} />
            </Provider>
        )

        expect(document.querySelector(`.p${decile}`)).toBeInTheDocument()
    })
})
