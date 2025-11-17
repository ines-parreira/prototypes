import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import moment from 'moment'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import SearchResultDonut from 'domains/reporting/pages/help-center/components/SearchResultDonut/SearchResultDonut'
import { useSearchResultRange } from 'domains/reporting/pages/help-center/hooks/useSearchResultRange'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock(
    'domains/reporting/pages/help-center/hooks/useSearchResultRange',
    () => ({
        useSearchResultRange: jest.fn(),
    }),
)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
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
