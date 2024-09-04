import {screen} from '@testing-library/react'
import React from 'react'
import {ResolvedTicketsTrendCard} from 'pages/stats/support-performance/auto-qa/ResolvedTicketsTrendCard'
import {ReviewedClosedTicketsTrendCard} from 'pages/stats/support-performance/auto-qa/ReviewedClosedTicketsTrendCard'
import AutoQA, {
    AUTO_QA_PAGE_TITLE,
} from 'pages/stats/support-performance/auto-qa/AutoQA'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('pages/stats/SupportPerformanceFilters', () => ({
    SupportPerformanceFilters: () => <div />,
}))
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock(
    'pages/stats/support-performance/auto-qa/ReviewedClosedTicketsTrendCard'
)
const NumberOfClosedTicketsReviewedTrendCardMock = assumeMock(
    ReviewedClosedTicketsTrendCard
)
jest.mock('pages/stats/support-performance/auto-qa/ResolvedTicketsTrendCard')
const ResolvedTicketsTrendCardMock = assumeMock(ResolvedTicketsTrendCard)

describe('AutoQA', () => {
    beforeEach(() => {
        NumberOfClosedTicketsReviewedTrendCardMock.mockImplementation(() => (
            <div />
        ))
        ResolvedTicketsTrendCardMock.mockImplementation(() => <div />)
    })

    it('should render page title', () => {
        renderWithStore(<AutoQA />, {})

        expect(screen.getByText(AUTO_QA_PAGE_TITLE)).toBeInTheDocument()
        expect(NumberOfClosedTicketsReviewedTrendCardMock).toHaveBeenCalled()
        expect(ResolvedTicketsTrendCardMock).toHaveBeenCalled()
    })
})
