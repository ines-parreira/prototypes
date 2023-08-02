import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {useClosedTicketsMetric} from 'hooks/reporting/metrics'
import {ClosedTicketsCellSummary} from 'pages/stats/ClosedTicketsCellSummary'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metrics')
const useClosedTicketsMetricMock = assumeMock(useClosedTicketsMetric)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<ClosedTicketsCellSummary>', () => {
    const closedTicketsValue = 1234

    const defaultState = {
        stats: initialState,
    } as RootState

    const useClosedTicketsMetricMockReturnValue = {
        data: {
            value: closedTicketsValue,
        },
        isFetching: false,
        isError: false,
    }

    useClosedTicketsMetricMock.mockReturnValue(
        useClosedTicketsMetricMockReturnValue
    )

    it('should render value as decimal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <ClosedTicketsCellSummary />
            </Provider>
        )

        expect(screen.getByText(closedTicketsValue)).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useClosedTicketsMetricMock.mockReturnValue({
            ...useClosedTicketsMetricMockReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <ClosedTicketsCellSummary />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
