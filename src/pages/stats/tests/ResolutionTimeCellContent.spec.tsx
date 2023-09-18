import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {TicketMessagesMeasure} from 'models/reporting/cubes/TicketMessagesCube'
import {useResolutionTimeMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {ResolutionTimeCellContent} from 'pages/stats/ResolutionTimeCellContent'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metricsPerDimension')
const useResolutionTimeMetricPerAgentMock = assumeMock(
    useResolutionTimeMetricPerAgent
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<ResolutionTimeCellContent>', () => {
    const agentId = 123
    const resolutionTimeValue = 1234

    const defaultState = {
        stats: initialState,
        ui: {
            agentPerformance: agentPerformanceInitialState,
            stats: uiStatsInitialState,
        },
    } as RootState

    const useResolutionTimeMetricPerAgentReturnValue = {
        data: {
            value: resolutionTimeValue,
            decile: 5,
            allData: [
                {
                    [TicketMessagesMeasure.ResolutionTime]:
                        String(resolutionTimeValue),
                    [TicketDimension.AssigneeUserId]: String(agentId),
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    useResolutionTimeMetricPerAgentMock.mockReturnValue(
        useResolutionTimeMetricPerAgentReturnValue
    )

    it('should render value as duration', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <ResolutionTimeCellContent agentId={agentId} />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    resolutionTimeValue,
                    'duration',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useResolutionTimeMetricPerAgentMock.mockReturnValue({
            ...useResolutionTimeMetricPerAgentReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <ResolutionTimeCellContent agentId={agentId} />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
