import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import noop from 'lodash/noop'

import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'

import {useMetric} from 'hooks/reporting/useMetric'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {ReportingGranularity} from 'models/reporting/types'
import {SearchTermsTable} from 'pages/stats/help-center/components/SearchTermsTable/SearchTermsTable'
import {useSelectedHelpCenter} from 'pages/stats/help-center/hooks/useSelectedHelpCenter'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetric', () => ({
    useMetric: jest.fn(),
}))
jest.mock('hooks/reporting/useMetricPerDimension', () => ({
    useMetricPerDimension: jest.fn(),
}))
jest.mock('pages/stats/help-center/hooks/useSearchQueryMetrics', () => ({
    useSearchQueryMetrics: () => ({data: []}),
}))
jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)
jest.mock('pages/stats/help-center/hooks/useSelectedHelpCenter')
const useSelectedHelpCenterMock = assumeMock(useSelectedHelpCenter)

const mockUseMetricPerDimension = jest.mocked(useMetricPerDimension)
const mockUseMetric = jest.mocked(useMetric)

const mockStore = configureMockStore([thunk])
const store = mockStore({})

const helpCenterDomain = 'acme'

const renderComponent = () => {
    render(
        <Provider store={store}>
            <SearchTermsTable helpCenterDomain={helpCenterDomain} />
        </Provider>
    )
}

describe('<SearchTermsTable/>', () => {
    const statsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00+02:00',
            end_datetime: '2021-06-04T23:59:59+02:00',
        },
    }
    const timezone = 'US'
    beforeEach(() => {
        useNewStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone: timezone,
            granularity: ReportingGranularity.Day,
            isAnalyticsNewFilters: true,
        })
        useSelectedHelpCenterMock.mockReturnValue({
            activeHelpCenters: [],
            helpCenters: [],
            isLoading: false,
            selectedHelpCenter: {} as any,
            setStatsFilters: noop,
            sortedHelpCenters: [],
            statsFilters,
            helpCenterId: 123,
            selectedHelpCenterDomain: helpCenterDomain,
        })
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                allData: [],
                decile: null,
            },
        })
        mockUseMetric.mockReturnValue({
            data: {
                value: null,
            },
            isFetching: false,
            isError: false,
        })
    })

    it('should paginate to the next page', () => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                allData: [
                    {
                        [HelpCenterTrackingEventDimensions.SearchQuery]:
                            'report issue',
                        [HelpCenterTrackingEventMeasures.SearchRequestedQueryCount]:
                            '10',
                        [HelpCenterTrackingEventMeasures.SearchArticlesClickedCount]:
                            '3',
                    },
                ],
                decile: null,
            },
        })
        mockUseMetric.mockReturnValue({
            data: {
                value: 40,
            },
            isFetching: false,
            isError: false,
        })

        renderComponent()

        expect(screen.getByText('1')).toHaveAttribute('aria-current', 'true')
        expect(screen.getByText('2')).toHaveAttribute('aria-current', 'false')

        userEvent.click(screen.getByText('2'))

        expect(screen.getByText('1')).toHaveAttribute('aria-current', 'false')
        expect(screen.getByText('2')).toHaveAttribute('aria-current', 'true')
    })

    it('should render modal on article count click', () => {
        mockUseMetricPerDimension.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                allData: [
                    {
                        [HelpCenterTrackingEventDimensions.SearchQuery]:
                            'report issue',
                        [HelpCenterTrackingEventMeasures.SearchRequestedQueryCount]:
                            '10',
                        [HelpCenterTrackingEventMeasures.SearchArticlesClickedCount]:
                            '3',
                        [HelpCenterTrackingEventMeasures.SearchArticlesClickedCountUnique]:
                            '3',
                    },
                ],
                decile: null,
            },
        })

        renderComponent()

        expect(screen.getByTestId('Search term-0')).toHaveTextContent(
            'report issue'
        )
        expect(screen.getByTestId('Search count-0')).toHaveTextContent('10')
        expect(screen.getByTestId('Article clicked-0')).toHaveTextContent('3')
        expect(screen.getByTestId('Click - through rate-0')).toHaveTextContent(
            '30%'
        )

        userEvent.click(screen.getByTestId('Article clicked-0'))

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByRole('heading', {level: 5})).toHaveTextContent(
            'report issue'
        )
    })
})
