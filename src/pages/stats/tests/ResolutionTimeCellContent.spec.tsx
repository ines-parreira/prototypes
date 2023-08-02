import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {TicketDimension, TicketMeasure} from 'models/reporting/types'
import {useResolutionTimeMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {formatDuration} from 'pages/stats/common/utils'
import {ResolutionTimeCellContent} from 'pages/stats/ResolutionTimeCellContent'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {assumeMock} from 'utils/testing'

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
        },
    } as RootState

    const useResolutionTimeMetricPerAgentReturnValue = {
        data: {
            value: resolutionTimeValue,
            allData: [
                {
                    [TicketMeasure.ResolutionTime]: resolutionTimeValue,
                    [TicketDimension.AssigneeUserId]: agentId,
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
            screen.getByText(formatDuration(resolutionTimeValue, 2))
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
