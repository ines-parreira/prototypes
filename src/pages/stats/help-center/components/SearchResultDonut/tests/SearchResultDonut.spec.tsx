import React from 'react'
import {render, screen} from '@testing-library/react'
import moment from 'moment'
import {formatReportingQueryDate} from 'utils/reporting'
import {StatsFilters} from 'models/stat/types'
import SearchResultDonut from '../SearchResultDonut'
import {useSearchResultRange} from '../../../hooks/useSearchResultRange'

jest.mock('../../../hooks/useSearchResultRange', () => ({
    useSearchResultRange: jest.fn(),
}))

const periodStart = formatReportingQueryDate(moment())
const periodEnd = formatReportingQueryDate(moment().subtract(7, 'd'))
const statsFilters: StatsFilters = {
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
        mockUseSearchResultRange.mockReturnValue({isLoading: false, data: []})
    })
    it('should render', () => {
        renderComponent()
        expect(screen.getByText('Search results')).toBeInTheDocument()
    })
})
