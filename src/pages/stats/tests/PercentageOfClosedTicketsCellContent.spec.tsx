import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {TicketDimension, TicketMeasure} from 'models/reporting/types'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {useClosedTicketsMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {useClosedTicketsMetric} from 'hooks/reporting/metrics'
import {PercentageOfClosedTicketsCellContent} from 'pages/stats/PercentageOfClosedTicketsCellContent'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {assumeMock} from 'utils/testing'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metrics')
jest.mock('hooks/reporting/metricsPerDimension')
const useClosedTicketsMetricPerAgentMock = assumeMock(
    useClosedTicketsMetricPerAgent
)
const useClosedTicketsMetricMock = assumeMock(useClosedTicketsMetric)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<PercentageOfClosedTicketsCellContent>', () => {
    const agentId = 123
    const closedTicketsValue = 123
    const allClosedTicketsValue = 1234

    const defaultState = {
        stats: initialState,
        ui: {
            agentPerformance: agentPerformanceInitialState,
        },
    } as RootState

    const useClosedTicketsMetricPerAgentMockReturnValue = {
        data: {
            value: closedTicketsValue,
            allData: [
                {
                    [TicketMeasure.TicketCount]: closedTicketsValue,
                    [TicketDimension.AssigneeUserId]: agentId,
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    const useClosedTicketsMetricMockReturnValue = {
        data: {value: allClosedTicketsValue},
        isFetching: false,
        isError: false,
    }

    useClosedTicketsMetricPerAgentMock.mockReturnValue(
        useClosedTicketsMetricPerAgentMockReturnValue
    )

    useClosedTicketsMetricMock.mockReturnValue(
        useClosedTicketsMetricMockReturnValue
    )

    it('should render value as percentage', () => {
        const formattedValue = formatMetricValue(
            (closedTicketsValue / allClosedTicketsValue) * 100,
            'percent',
            NOT_AVAILABLE_PLACEHOLDER
        )
        render(
            <Provider store={mockStore(defaultState)}>
                <PercentageOfClosedTicketsCellContent agentId={agentId} />
            </Provider>
        )

        expect(screen.getByText(formattedValue)).toBeInTheDocument()
    })

    it('should render value as -', () => {
        useClosedTicketsMetricPerAgentMock.mockReturnValue({
            ...useClosedTicketsMetricPerAgentMockReturnValue,
            data: {
                ...useClosedTicketsMetricPerAgentMockReturnValue.data,
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
        useClosedTicketsMetricMock.mockReturnValue({
            ...useClosedTicketsMetricMockReturnValue,
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
