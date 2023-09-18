import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {TicketMessagesMeasure} from 'models/reporting/cubes/TicketMessagesCube'
import {useFirstResponseTimeMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {FirstResponseTimeCellContent} from 'pages/stats/FirstResponseTimeCellContent'
import {initialState} from 'state/stats/reducers'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metricsPerDimension')
const useFirstResponseTimeMetricPerAgentMock = assumeMock(
    useFirstResponseTimeMetricPerAgent
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<FirstResponseTimeCellContent>', () => {
    const agentId = 123
    const firstResponseTimeValue = 1234

    const defaultState = {
        stats: initialState,
        ui: {
            agentPerformance: agentPerformanceInitialState,
            stats: uiStatsInitialState,
        },
    } as RootState

    const useFirstResponseTimeMetricPerAgentReturnValue = {
        data: {
            value: firstResponseTimeValue,
            decile: 5,
            allData: [
                {
                    [TicketMessagesMeasure.FirstResponseTime]: String(
                        firstResponseTimeValue
                    ),
                    [TicketDimension.AssigneeUserId]: String(agentId),
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    useFirstResponseTimeMetricPerAgentMock.mockReturnValue(
        useFirstResponseTimeMetricPerAgentReturnValue
    )

    it('should render value as duration', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <FirstResponseTimeCellContent agentId={agentId} />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    firstResponseTimeValue,
                    'duration',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useFirstResponseTimeMetricPerAgentMock.mockReturnValue({
            ...useFirstResponseTimeMetricPerAgentReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <FirstResponseTimeCellContent agentId={agentId} />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
