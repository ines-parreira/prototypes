import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {useMedianResolutionTimeMetric} from 'hooks/reporting/metrics'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {MedianResolutionTimeCellSummary} from 'pages/stats/MedianResolutionTimeCellSummary'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metrics')
const useResolutionTimeMetricMock = assumeMock(useMedianResolutionTimeMetric)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<MedianResolutionTimeCellSummary>', () => {
    const medianResolutionTimeValue = 1234

    const defaultState = {
        stats: initialState,
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    const useResolutionTimeMetricReturnValue = {
        data: {
            value: medianResolutionTimeValue,
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
                <MedianResolutionTimeCellSummary />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    medianResolutionTimeValue,
                    'duration',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
        ).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useResolutionTimeMetricMock.mockReturnValue({
            ...useResolutionTimeMetricReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <MedianResolutionTimeCellSummary />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
