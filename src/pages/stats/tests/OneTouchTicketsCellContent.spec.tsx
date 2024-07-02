import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'
import {useOneTouchTicketsPercentageMetricPerAgent} from 'hooks/reporting/useOneTouchTicketsPercentageMetricPerAgent'
import {OneTouchTicketsCellContent} from 'pages/stats/OneTouchTicketsCellContent'
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

jest.mock('hooks/reporting/useOneTouchTicketsPercentageMetricPerAgent')
const useOneTouchTicketsPercentageMetricPerAgentMock = assumeMock(
    useOneTouchTicketsPercentageMetricPerAgent
)

jest.mock('@gorgias/ui-kit', () => ({
    Tooltip: () => <div />,
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<PercentageOfClosedTicketsCellContent>', () => {
    const agent = {
        id: 123,
        name: 'User',
    } as User
    const oneTouchTicketsValue = 2.5
    const defaultState = {
        stats: initialState,
        ui: {
            agentPerformance: agentPerformanceInitialState,
            stats: uiStatsInitialState,
        },
    } as RootState

    const useOneTouchTicketsPercentageMetricPerAgentMockReturnValue = {
        data: {
            value: oneTouchTicketsValue,
            decile: 5,
            allData: [
                {
                    [TicketMeasure.TicketCount]: String(oneTouchTicketsValue),
                    [TicketDimension.AssigneeUserId]: String(agent.id),
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    useOneTouchTicketsPercentageMetricPerAgentMock.mockReturnValue(
        useOneTouchTicketsPercentageMetricPerAgentMockReturnValue
    )

    it('should render value as percentage', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <OneTouchTicketsCellContent agent={agent} />
            </Provider>
        )

        expect(screen.getByText(`${oneTouchTicketsValue}%`)).toBeInTheDocument()
    })

    it('should render value as -', () => {
        useOneTouchTicketsPercentageMetricPerAgentMock.mockReturnValue({
            ...useOneTouchTicketsPercentageMetricPerAgentMockReturnValue,
            data: {
                ...useOneTouchTicketsPercentageMetricPerAgentMockReturnValue.data,
                value: null,
            },
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <OneTouchTicketsCellContent agent={agent} />
            </Provider>
        )

        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useOneTouchTicketsPercentageMetricPerAgentMock.mockReturnValue({
            ...useOneTouchTicketsPercentageMetricPerAgentMockReturnValue,
            isFetching: true,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <OneTouchTicketsCellContent agent={agent} />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
