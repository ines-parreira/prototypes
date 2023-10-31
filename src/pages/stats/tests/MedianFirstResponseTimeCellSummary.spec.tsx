import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {useMedianFirstResponseTimeMetric} from 'hooks/reporting/metrics'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {MedianFirstResponseTimeCellSummary} from 'pages/stats/MedianFirstResponseTimeCellSummary'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metrics')
const useMedianFirstResponseTimeMetricMock = assumeMock(
    useMedianFirstResponseTimeMetric
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<MedianFirstResponseTimeCellContent>', () => {
    const medianFirstResponseTimeValue = 1234

    const defaultState = {
        stats: initialState,
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    const useMedianFirstResponseTimeMetricReturnValue = {
        data: {
            value: medianFirstResponseTimeValue,
        },
        isFetching: false,
        isError: false,
    }

    useMedianFirstResponseTimeMetricMock.mockReturnValue(
        useMedianFirstResponseTimeMetricReturnValue
    )

    it('should render value as duration', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <MedianFirstResponseTimeCellSummary />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    medianFirstResponseTimeValue,
                    'duration',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useMedianFirstResponseTimeMetricMock.mockReturnValue({
            ...useMedianFirstResponseTimeMetricReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <MedianFirstResponseTimeCellSummary />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
