import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {ReportingGranularity} from 'models/reporting/types'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {
    useOneTouchTicketsMetric,
    useClosedTicketsMetric,
} from 'hooks/reporting/metrics'
import {
    OneTouchTicketsCellSummary,
    calculatePercentage,
} from 'pages/stats/OneTouchTicketsCellSummary'
import {initialState} from 'state/stats/reducers'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {RootState, StoreDispatch} from 'state/types'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {assumeMock} from 'utils/testing'

const MOCK_SKELETON_TEST_ID = 'skeleton'

jest.mock('pages/common/components/Skeleton/Skeleton', () => () => (
    <div data-testid={MOCK_SKELETON_TEST_ID} />
))

jest.mock('hooks/reporting/metrics')
jest.mock('state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone
)
const useOneTouchTicketsMetricMock = assumeMock(useOneTouchTicketsMetric)
const useClosedTicketsMetricMock = assumeMock(useClosedTicketsMetric)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<PercentageOfClosedTicketsCellSummary>', () => {
    const allTicketsCount = 100
    const allClosedTicketsCount = 500

    const defaultState = {
        stats: initialState,
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    const useOneTouchTicketsMetricMockReturnValue = {
        data: {value: allTicketsCount},
        isFetching: false,
        isError: false,
    }

    useOneTouchTicketsMetricMock.mockReturnValue(
        useOneTouchTicketsMetricMockReturnValue
    )

    const useClosedTicketsMetricMockReturnValue = {
        data: {value: allClosedTicketsCount},
        isFetching: false,
        isError: false,
    }

    useClosedTicketsMetricMock.mockReturnValue(
        useClosedTicketsMetricMockReturnValue
    )

    getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
        userTimezone: 'someTimezone',
        cleanStatsFilters: {
            period: {
                start_datetime: '1970-01-01T00:00:00+00:00',
                end_datetime: '1970-01-01T00:00:00+00:00',
            },
        },
        granularity: ReportingGranularity.Day,
    })

    it('should render value as percentage', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <OneTouchTicketsCellSummary />
            </Provider>
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    calculatePercentage(allTicketsCount, allClosedTicketsCount),
                    'percent',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )
        ).toBeInTheDocument()
    })

    it('should render placeholder on missing one of the value', () => {
        useOneTouchTicketsMetricMock.mockReturnValue({
            ...useOneTouchTicketsMetricMockReturnValue,
            data: {value: null},
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <OneTouchTicketsCellSummary />
            </Provider>
        )

        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })

    it('should render skeleton when fetching', () => {
        useOneTouchTicketsMetricMock.mockReturnValue({
            ...useOneTouchTicketsMetricMockReturnValue,
            isFetching: true,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <OneTouchTicketsCellSummary />
            </Provider>
        )

        expect(screen.getByTestId(MOCK_SKELETON_TEST_ID)).toBeInTheDocument()
    })
})
