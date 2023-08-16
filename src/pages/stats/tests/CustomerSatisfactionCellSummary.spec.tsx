import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {useCustomerSatisfactionMetric} from 'hooks/reporting/metrics'
import {CustomerSatisfactionCellSummary} from 'pages/stats/CustomerSatisfactionCellSummary'
import {initialState} from 'state/stats/reducers'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metrics')
const useCustomerSatisfactionMetricMock = assumeMock(
    useCustomerSatisfactionMetric
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<CustomerSatisfactionCellSummary>', () => {
    const surveyScoreValue = 4

    const defaultState = {
        stats: initialState,
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    const useCustomerSatisfactionMetricMockReturnValue = {
        data: {
            value: surveyScoreValue,
        },
        isFetching: false,
        isError: false,
    }

    useCustomerSatisfactionMetricMock.mockReturnValue(
        useCustomerSatisfactionMetricMockReturnValue
    )

    it('should render value as decimal', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <CustomerSatisfactionCellSummary />
            </Provider>
        )

        expect(screen.getByText(surveyScoreValue)).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useCustomerSatisfactionMetricMock.mockReturnValue({
            ...useCustomerSatisfactionMetricMockReturnValue,
            isFetching: true,
        })
        render(
            <Provider store={mockStore(defaultState)}>
                <CustomerSatisfactionCellSummary />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
