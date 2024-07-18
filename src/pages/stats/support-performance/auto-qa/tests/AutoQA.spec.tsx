import {screen} from '@testing-library/react'
import React from 'react'
import {NumberOfClosedTicketsReviewedTrendCard} from 'pages/stats/support-performance/auto-qa/NumberOfClosedTicketsReviewedTrendCard'
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
    'pages/stats/support-performance/auto-qa/NumberOfClosedTicketsReviewedTrendCard'
)
const NumberOfClosedTicketsReviewedTrendCardMock = assumeMock(
    NumberOfClosedTicketsReviewedTrendCard
)

describe('AutoQA', () => {
    beforeEach(() => {
        NumberOfClosedTicketsReviewedTrendCardMock.mockImplementation(() => (
            <div />
        ))
    })

    it('should render page title', () => {
        renderWithStore(<AutoQA />, {})

        expect(screen.getByText(AUTO_QA_PAGE_TITLE)).toBeInTheDocument()
        expect(NumberOfClosedTicketsReviewedTrendCardMock).toHaveBeenCalled()
    })
})
