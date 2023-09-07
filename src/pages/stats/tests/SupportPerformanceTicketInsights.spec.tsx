import React from 'react'
import {render, screen} from '@testing-library/react'
import SupportPerformanceTicketInsights, {
    TICKET_INSIGHTS_PAGE_TITLE,
} from 'pages/stats/SupportPerformanceTicketInsights'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/SupportPerformanceFilters.tsx')
const SupportPerformanceFiltersMock = assumeMock(SupportPerformanceFilters)
const cellMock = () => <div />

describe('<SupportPerformanceTicketInsights />', () => {
    beforeEach(() => {
        SupportPerformanceFiltersMock.mockImplementation(cellMock)
    })
    it('should render the page title', () => {
        render(<SupportPerformanceTicketInsights />)

        const title = screen.getByText(TICKET_INSIGHTS_PAGE_TITLE)

        expect(title).toBeInTheDocument()
    })

    it('should render the Filters', () => {
        render(<SupportPerformanceTicketInsights />)

        expect(SupportPerformanceFiltersMock).toHaveBeenCalled()
    })
})
