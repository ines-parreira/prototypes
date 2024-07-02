import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {TicketHandleTimeCellContent} from 'pages/stats/TicketHandleTimeCellContent'
import {HandleTimeMeasure} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {useTicketAverageHandleTimePerAgent} from 'hooks/reporting/metricsPerAgent'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {initialState} from 'state/stats/statsSlice'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {User} from 'config/types/user'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metricsPerAgent')
const useTicketHandleTimePerAgentMock = assumeMock(
    useTicketAverageHandleTimePerAgent
)

jest.mock('@gorgias/ui-kit', () => ({
    Tooltip: () => <div />,
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<TicketHandleTimeCellContent>', () => {
    const agent = {
        id: 123,
        name: 'User',
    } as User
    const ticketHandleTimeMetric = 1234
    const decile = 5
    const defaultState = {
        stats: initialState,
        ui: {
            agentPerformance: agentPerformanceInitialState,
            stats: uiStatsInitialState,
        },
    } as RootState

    const useTicketHandleTimePerAgentReturnValue = {
        data: {
            value: ticketHandleTimeMetric,
            decile,
            allData: [
                {
                    [HandleTimeMeasure.HandleTime]: String(
                        ticketHandleTimeMetric
                    ),
                    [TicketDimension.AssigneeUserId]: String(agent.id),
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        useTicketHandleTimePerAgentMock.mockReturnValue(
            useTicketHandleTimePerAgentReturnValue
        )
    })

    it('should render value as duration', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketHandleTimeCellContent agent={agent} />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    ticketHandleTimeMetric,
                    'duration',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useTicketHandleTimePerAgentMock.mockReturnValue({
            ...useTicketHandleTimePerAgentReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketHandleTimeCellContent agent={agent} />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
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
                <TicketHandleTimeCellContent agent={agent} />
            </Provider>
        )

        expect(document.querySelector(`.p${decile}`)).toBeInTheDocument()
    })
})
