import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import React from 'react'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {ReportingGranularity} from 'models/reporting/types'
import NoSearchTable from 'pages/stats/help-center/components/NoSearchTable/NoSearchTable'
import {useNoSearchResultsMetrics} from 'pages/stats/help-center/hooks/useNoSearchResultsMetrics'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('pages/stats/help-center/hooks/useNoSearchResultsMetrics', () => ({
    useNoSearchResultsMetrics: jest.fn(),
}))

jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

const mockUseNoSearchResultsMetrics = jest.mocked(useNoSearchResultsMetrics)

const renderComponent = () => {
    renderWithStore(<NoSearchTable />, {})
}

describe('<NoSearchTable/>', () => {
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
        mockUseNoSearchResultsMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            total: 0,
        })
    })

    it('should render', () => {
        renderComponent()
        expect(screen.getByText('No search results')).toBeInTheDocument()
    })

    it('should render no data state', () => {
        renderComponent()
        expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should paginate to the next page', () => {
        mockUseNoSearchResultsMetrics.mockReturnValue({
            data: [[]],
            isLoading: false,
            total: 40,
        })

        renderComponent()

        expect(screen.getByText('1')).toHaveAttribute('aria-current', 'true')
        expect(screen.getByText('2')).toHaveAttribute('aria-current', 'false')

        userEvent.click(screen.getByText('2'))

        expect(screen.getByText('1')).toHaveAttribute('aria-current', 'false')
        expect(screen.getByText('2')).toHaveAttribute('aria-current', 'true')
    })
})
