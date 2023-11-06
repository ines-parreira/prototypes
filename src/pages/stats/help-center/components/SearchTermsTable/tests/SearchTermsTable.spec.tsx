import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchTermsTable from '../SearchTermsTable'
import {useSearchTermsMetrics} from '../../../hooks/useSearchTermsMetrics'

jest.mock('../../../hooks/useSearchTermsMetrics', () => ({
    useSearchTermsMetrics: jest.fn(),
}))

const mockUseSearchTermsMetrics = jest.mocked(useSearchTermsMetrics)

const renderComponent = () => {
    render(
        <SearchTermsTable
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
        mockUseSearchTermsMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            total: 0,
        })
    })

    it('should render', () => {
        renderComponent()
        expect(
            screen.getByText('Search terms with results')
        ).toBeInTheDocument()
    })

    it('should paginate to the next page', () => {
        mockUseSearchTermsMetrics.mockReturnValue({
            data: [],
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
