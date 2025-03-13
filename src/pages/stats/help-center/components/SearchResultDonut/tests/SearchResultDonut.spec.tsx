import React from 'react'

import { render, screen } from '@testing-library/react'
import moment from 'moment'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import SearchResultDonut from 'pages/stats/help-center/components/SearchResultDonut/SearchResultDonut'
import { useSearchResultRange } from 'pages/stats/help-center/hooks/useSearchResultRange'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/help-center/hooks/useSearchResultRange', () => ({
    useSearchResultRange: jest.fn(),
}))
jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

const mockUseSearchResultRange = jest.mocked(useSearchResultRange)

const renderComponent = () => {
    render(<SearchResultDonut />)
}

describe('<SearchResultDonut/>', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment().subtract(7, 'd'))
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: periodStart,
            end_datetime: periodEnd,
        },
    }
    const timezone = 'UTC'

    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone: timezone,
            granularity: ReportingGranularity.Day,
        })
        mockUseSearchResultRange.mockReturnValue({
            isLoading: false,
            data: [{ label: 'Search', value: 3 }],
        })
    })

    it('should render', () => {
        renderComponent()

        expect(screen.getByText('Search results')).toBeInTheDocument()
    })

    it('should show no data state', () => {
        mockUseSearchResultRange.mockReturnValue({ isLoading: false, data: [] })

        renderComponent()

        expect(screen.getByText('No data available')).toBeInTheDocument()
    })
})
