import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {useClosedTicketsMetric} from 'hooks/reporting/metrics'
import {PercentageOfClosedTicketsCellSummary} from 'pages/stats/PercentageOfClosedTicketsCellSummary'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {assumeMock} from 'utils/testing'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metrics')
const useClosedTicketsMetricMock = assumeMock(useClosedTicketsMetric)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<PercentageOfClosedTicketsCellSummary>', () => {
    const allClosedTicketsValue = 1234

    const defaultState = {
        stats: initialState,
        ui: {
            agentPerformance: agentPerformanceInitialState,
        },
    } as RootState

    const useClosedTicketsMetricMockReturnValue = {
        data: {value: allClosedTicketsValue},
        isFetching: false,
        isError: false,
    }

    useClosedTicketsMetricMock.mockReturnValue(
        useClosedTicketsMetricMockReturnValue
    )

    it('should render value as percentage', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <PercentageOfClosedTicketsCellSummary />
            </Provider>
        )

        expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useClosedTicketsMetricMock.mockReturnValue({
            ...useClosedTicketsMetricMockReturnValue,
            isFetching: true,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <PercentageOfClosedTicketsCellSummary />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
