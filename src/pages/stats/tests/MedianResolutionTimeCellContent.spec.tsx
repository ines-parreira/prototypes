import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {TicketMessagesMeasure} from 'models/reporting/cubes/TicketMessagesCube'
import {useMedianResolutionTimeMetricPerAgent} from 'hooks/reporting/metricsPerAgent'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {MedianResolutionTimeCellContent} from 'pages/stats/MedianResolutionTimeCellContent'
import {initialState} from 'state/stats/statsSlice'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {User} from 'config/types/user'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metricsPerAgent')
const useMedianResolutionTimeMetricPerAgentMock = assumeMock(
    useMedianResolutionTimeMetricPerAgent
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<MedianResolutionTimeCellContent>', () => {
    const agent = {
        id: 123,
        name: 'User',
    } as User
    const medianResolutionTimeValue = 1234
    const defaultState = {
        stats: initialState,
        ui: {
            agentPerformance: agentPerformanceInitialState,
            stats: uiStatsInitialState,
        },
    } as RootState

    const useMedianResolutionTimeMetricPerAgentReturnValue = {
        data: {
            value: medianResolutionTimeValue,
            decile: 5,
            allData: [
                {
                    [TicketMessagesMeasure.MedianResolutionTime]: String(
                        medianResolutionTimeValue
                    ),
                    [TicketDimension.AssigneeUserId]: String(agent.id),
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    useMedianResolutionTimeMetricPerAgentMock.mockReturnValue(
        useMedianResolutionTimeMetricPerAgentReturnValue
    )

    it('should render value as duration', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <MedianResolutionTimeCellContent agent={agent} />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    medianResolutionTimeValue,
                    'duration',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useMedianResolutionTimeMetricPerAgentMock.mockReturnValue({
            ...useMedianResolutionTimeMetricPerAgentReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <MedianResolutionTimeCellContent agent={agent} />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
