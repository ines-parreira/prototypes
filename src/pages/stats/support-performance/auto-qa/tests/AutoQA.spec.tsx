import {screen} from '@testing-library/react'
import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {ResolvedTicketsTrendCard} from 'pages/stats/support-performance/auto-qa/ResolvedTicketsTrendCard'
import {ReviewedClosedTicketsTrendCard} from 'pages/stats/support-performance/auto-qa/ReviewedClosedTicketsTrendCard'
import AutoQA, {
    AUTO_QA_PAGE_TITLE,
} from 'pages/stats/support-performance/auto-qa/AutoQA'
import {assumeMock, renderWithStore} from 'utils/testing'
import {FeatureFlagKey} from 'config/featureFlags'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'

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
const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>
jest.mock('pages/stats/common/filters/FiltersPanel')
const filtersPanelMock = assumeMock(FiltersPanel)

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

describe('AutoQA with isAnalyticsNewFilters', () => {
    beforeEach(() => {
        NumberOfClosedTicketsReviewedTrendCardMock.mockImplementation(() => (
            <div />
        ))
        ResolvedTicketsTrendCardMock.mockImplementation(() => <div />)
        filtersPanelMock.mockImplementation(() => <div>FiltersHeaderMock</div>)
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
        })
    })

    it('should render page title', () => {
        renderWithStore(<AutoQA />, {})

        expect(screen.getByText(AUTO_QA_PAGE_TITLE)).toBeInTheDocument()
        expect(NumberOfClosedTicketsReviewedTrendCardMock).toHaveBeenCalled()
        expect(ResolvedTicketsTrendCardMock).toHaveBeenCalled()
        expect(screen.getByText('FiltersHeaderMock')).toBeTruthy()
    })
})
