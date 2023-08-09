import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {TicketDimension, TicketMeasure} from 'models/reporting/types'
import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'
import {usePercentageOfClosedTicketsMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {PercentageOfClosedTicketsCellContent} from 'pages/stats/PercentageOfClosedTicketsCellContent'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {assumeMock} from 'utils/testing'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metricsPerDimension')
const usePercentageOfClosedTicketsMetricPerAgentMock = assumeMock(
    usePercentageOfClosedTicketsMetricPerAgent
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<PercentageOfClosedTicketsCellContent>', () => {
    const agentId = 123
    const percentageOfClosedTicketsValue = 2.5

    const defaultState = {
        stats: initialState,
        ui: {
            agentPerformance: agentPerformanceInitialState,
        },
    } as RootState

    const usePercentageOfClosedTicketsMetricPerAgentMockReturnValue = {
        data: {
            value: percentageOfClosedTicketsValue,
            allData: [
                {
                    [TicketMeasure.TicketCount]: percentageOfClosedTicketsValue,
                    [TicketDimension.AssigneeUserId]: agentId,
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    usePercentageOfClosedTicketsMetricPerAgentMock.mockReturnValue(
        usePercentageOfClosedTicketsMetricPerAgentMockReturnValue
    )

    it('should render value as percentage', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <PercentageOfClosedTicketsCellContent agentId={agentId} />
            </Provider>
        )

        expect(
            screen.getByText(`${percentageOfClosedTicketsValue}%`)
        ).toBeInTheDocument()
    })

    it('should render value as -', () => {
        usePercentageOfClosedTicketsMetricPerAgentMock.mockReturnValue({
            ...usePercentageOfClosedTicketsMetricPerAgentMockReturnValue,
            data: {
                ...usePercentageOfClosedTicketsMetricPerAgentMockReturnValue.data,
                value: null,
            },
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <PercentageOfClosedTicketsCellContent agentId={agentId} />
            </Provider>
        )

        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        usePercentageOfClosedTicketsMetricPerAgentMock.mockReturnValue({
            ...usePercentageOfClosedTicketsMetricPerAgentMockReturnValue,
            isFetching: true,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <PercentageOfClosedTicketsCellContent agentId={agentId} />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
