import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {User} from 'config/types/user'
import {useMessagesSentPerHourPerAgent} from 'hooks/reporting/useMessagesSentPerHourPerAgent'
import {HelpdeskMessageMeasure} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {MessagesSentPerHourCellContent} from 'pages/stats/MessagesSentPerHourCellContent'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMessagesSentPerHourPerAgent')
const useMessagesSentPerHourPerAgentMock = assumeMock(
    useMessagesSentPerHourPerAgent
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<MessagesSentPerHourCellContent>', () => {
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

    const useMessagesSentPerHourPerAgentReturnValue = {
        data: {
            value: messagesSentValue,
            decile,
            allData: [
                {
                    [HelpdeskMessageMeasure.MessageCount]:
                        String(messagesSentValue),
                    [TicketDimension.AssigneeUserId]: String(agent.id),
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        useMessagesSentPerHourPerAgentMock.mockReturnValue(
            useMessagesSentPerHourPerAgentReturnValue
        )
    })

    it('should render value as decimal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <MessagesSentPerHourCellContent agent={agent} />
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
        useMessagesSentPerHourPerAgentMock.mockReturnValue({
            ...useMessagesSentPerHourPerAgentReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <MessagesSentPerHourCellContent agent={agent} />
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
                <MessagesSentPerHourCellContent agent={agent} />
            </Provider>
        )

        expect(document.querySelector(`.p${decile}`)).toBeInTheDocument()
    })
})
