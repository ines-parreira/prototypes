import {render, screen} from '@testing-library/react'
import moment from 'moment'
import React from 'react'

import {LegacyStatsFilters} from 'models/stat/types'
import SearchResultDonut from 'pages/stats/help-center/components/SearchResultDonut/SearchResultDonut'
import {useSearchResultRange} from 'pages/stats/help-center/hooks/useSearchResultRange'
import {formatReportingQueryDate} from 'utils/reporting'

jest.mock('pages/stats/help-center/hooks/useSearchResultRange', () => ({
    useSearchResultRange: jest.fn(),
}))

const periodStart = formatReportingQueryDate(moment())
const periodEnd = formatReportingQueryDate(moment().subtract(7, 'd'))
const statsFilters: LegacyStatsFilters = {
    period: {
        start_datetime: periodStart,
        end_datetime: periodEnd,
    },
}
const timezone = 'UTC'

const mockUseSearchResultRange = jest.mocked(useSearchResultRange)

const renderComponent = () => {
    render(
        <SearchResultDonut statsFilters={statsFilters} timezone={timezone} />
    )
}

describe('<SearchResultDonut/>', () => {
    beforeEach(() => {
        mockUseSearchResultRange.mockReturnValue({
            isLoading: false,
            data: [{label: 'Search', value: 3}],
        })
    })
    it('should render', () => {
        renderComponent()
        expect(screen.getByText('Search results')).toBeInTheDocument()
    })

    it('should show no data state', () => {
        mockUseSearchResultRange.mockReturnValue({isLoading: false, data: []})
        renderComponent()
        expect(screen.getByText('No data available')).toBeInTheDocument()
    })
})
