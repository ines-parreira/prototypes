import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {useMetric} from 'hooks/reporting/useMetric'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import SearchTermsTable from '../SearchTermsTable'

jest.mock('hooks/reporting/useMetric', () => ({
    useMetric: jest.fn(),
}))
jest.mock('hooks/reporting/useMetricPerDimension', () => ({
    useMetricPerDimension: jest.fn(),
}))
jest.mock('../../../hooks/useSearchQueryMetrics', () => ({
    useSearchQueryMetrics: () => ({data: []}),
}))

const mockUseMetricPerDimension = jest.mocked(useMetricPerDimension)
const mockUseMetric = jest.mocked(useMetric)

const renderComponent = () => {
    render(
        <SearchTermsTable
            helpCenterDomain="acme"
            statsFilters={{
                period: {
                    start_datetime: '2021-05-29T00:00:00+02:00',
                    end_datetime: '2021-06-04T23:59:59+02:00',
                },
            }}
            timezone="US"
        />
    )
}

describe('<SearchTermsTable/>', () => {
    beforeEach(() => {
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

    it('should render', () => {
        renderComponent()
        expect(
            screen.getByText('Search terms with results')
        ).toBeInTheDocument()
    })

    it('should render no data state', () => {
        renderComponent()
        expect(screen.getByText('No data available')).toBeInTheDocument()
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
