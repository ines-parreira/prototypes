import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {useCustomerSatisfactionMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {CustomerSatisfactionCellContent} from 'pages/stats/CustomerSatisfactionCellContent'
import {initialState} from 'state/stats/statsSlice'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {User} from 'config/types/user'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metricsPerDimension')
const useCustomerSatisfactionMetricPerAgentMock = assumeMock(
    useCustomerSatisfactionMetricPerAgent
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<CustomerSatisfactionCellContent>', () => {
    const agent = {
        id: 123,
        name: 'User',
    } as User
    const avgSurveyScoreValue = 5
    const defaultState = {
        stats: initialState,
        ui: {
            agentPerformance: agentPerformanceInitialState,
            stats: uiStatsInitialState,
        },
    } as RootState

    const useCustomerSatisfactionMetricPerAgentMockReturnValue = {
        data: {
            value: avgSurveyScoreValue,
            decile: 5,
            allData: [
                {
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]:
                        String(avgSurveyScoreValue),
                    [TicketDimension.AssigneeUserId]: String(agent.id),
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    useCustomerSatisfactionMetricPerAgentMock.mockReturnValue(
        useCustomerSatisfactionMetricPerAgentMockReturnValue
    )

    it('should render value as decimal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <CustomerSatisfactionCellContent agent={agent} />
            </Provider>
        )

        expect(screen.getByText(avgSurveyScoreValue)).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useCustomerSatisfactionMetricPerAgentMock.mockReturnValue({
            ...useCustomerSatisfactionMetricPerAgentMockReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <CustomerSatisfactionCellContent agent={agent} />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
