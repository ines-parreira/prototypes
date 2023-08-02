import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {useResolutionTimeMetric} from 'hooks/reporting/metrics'
import {formatDuration} from 'pages/stats/common/utils'
import {ResolutionTimeCellSummary} from 'pages/stats/ResolutionTimeCellSummary'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metrics')
const useResolutionTimeMetricMock = assumeMock(useResolutionTimeMetric)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<ResolutionTimeCellSummary>', () => {
    const resolutionTimeValue = 1234

    const defaultState = {
        stats: initialState,
    } as RootState

    const useResolutionTimeMetricReturnValue = {
        data: {
            value: resolutionTimeValue,
        },
        isFetching: false,
        isError: false,
    }

    useResolutionTimeMetricMock.mockReturnValue(
        useResolutionTimeMetricReturnValue
    )

    it('should render value as duration', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <ResolutionTimeCellSummary />
            </Provider>
        )

        expect(
            screen.getByText(formatDuration(resolutionTimeValue, 2))
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useResolutionTimeMetricMock.mockReturnValue({
            ...useResolutionTimeMetricReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <ResolutionTimeCellSummary />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
