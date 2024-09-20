import {screen} from '@testing-library/react'
import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {AutoQADownloadDataButton} from 'pages/stats/support-performance/auto-qa/AutoQADownloadDataButton'
import {AutoQAAgentPerformanceHeatmapSwitch} from 'pages/stats/support-performance/auto-qa/AutoQAAgentPerformanceHeatmapSwitch'
import {AutoQAAgentsTable} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTable'
import {ReviewedClosedTicketsTrendCard} from 'pages/stats/support-performance/auto-qa/ReviewedClosedTicketsTrendCard'
import {CommunicationSkillsTrendCard} from 'pages/stats/support-performance/auto-qa/CommunicationSkillsTrendCard'
import AutoQA, {
    AUTO_QA_PAGE_TITLE,
} from 'pages/stats/support-performance/auto-qa/AutoQA'
import {assumeMock, renderWithStore} from 'utils/testing'
import {FeatureFlagKey} from 'config/featureFlags'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {ResolutionCompletenessTrendCard} from 'pages/stats/support-performance/auto-qa/ResolutionCompletenessTrendCard'

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
jest.mock(
    'pages/stats/support-performance/auto-qa/ResolutionCompletenessTrendCard'
)
const ResolutionCompletenessTrendCardMock = assumeMock(
    ResolutionCompletenessTrendCard
)
jest.mock(
    'pages/stats/support-performance/auto-qa/CommunicationSkillsTrendCard'
)
const CommunicationSkillsTrendCardMock = assumeMock(
    CommunicationSkillsTrendCard
)
jest.mock('pages/stats/support-performance/auto-qa/AutoQAAgentsTable')
const AutoQAAgentsTableMock = assumeMock(AutoQAAgentsTable)
jest.mock(
    'pages/stats/support-performance/auto-qa/AutoQAAgentPerformanceHeatmapSwitch'
)
const AutoQAAgentPerformanceHeatmapSwitchMock = assumeMock(
    AutoQAAgentPerformanceHeatmapSwitch
)
jest.mock('pages/stats/support-performance/auto-qa/AutoQADownloadDataButton')
const AutoQADownloadButtonMock = assumeMock(AutoQADownloadDataButton)

const mockUseFlags = useFlags as jest.MockedFunction<typeof useFlags>

jest.mock('pages/stats/common/filters/FiltersPanel')
const filtersPanelMock = assumeMock(FiltersPanel)

describe('AutoQA', () => {
    beforeEach(() => {
        NumberOfClosedTicketsReviewedTrendCardMock.mockImplementation(() => (
            <div />
        ))
        ResolutionCompletenessTrendCardMock.mockImplementation(() => <div />)
        CommunicationSkillsTrendCardMock.mockImplementation(() => <div />)
        AutoQAAgentsTableMock.mockImplementation(() => <div />)
        AutoQAAgentPerformanceHeatmapSwitchMock.mockImplementation(() => (
            <div />
        ))
        AutoQADownloadButtonMock.mockImplementation(() => <div />)
    })

    it('should render page title', () => {
        renderWithStore(<AutoQA />, {})

        expect(screen.getByText(AUTO_QA_PAGE_TITLE)).toBeInTheDocument()
        expect(NumberOfClosedTicketsReviewedTrendCardMock).toHaveBeenCalled()
        expect(ResolutionCompletenessTrendCardMock).toHaveBeenCalled()
        expect(CommunicationSkillsTrendCardMock).toHaveBeenCalled()
        expect(AutoQAAgentPerformanceHeatmapSwitchMock).toHaveBeenCalled()
        expect(AutoQAAgentsTableMock).toHaveBeenCalled()
    })
})

describe('AutoQA with isAnalyticsNewFilters', () => {
    beforeEach(() => {
        NumberOfClosedTicketsReviewedTrendCardMock.mockImplementation(() => (
            <div />
        ))
        ResolutionCompletenessTrendCardMock.mockImplementation(() => <div />)
        CommunicationSkillsTrendCardMock.mockImplementation(() => <div />)
        filtersPanelMock.mockImplementation(() => <div>FiltersHeaderMock</div>)
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
        })
    })

    it('should render page title', () => {
        renderWithStore(<AutoQA />, {})

        expect(screen.getByText(AUTO_QA_PAGE_TITLE)).toBeInTheDocument()
        expect(NumberOfClosedTicketsReviewedTrendCardMock).toHaveBeenCalled()
        expect(ResolutionCompletenessTrendCardMock).toHaveBeenCalled()
        expect(CommunicationSkillsTrendCardMock).toHaveBeenCalled()
        expect(AutoQAAgentsTableMock).toHaveBeenCalled()
        expect(AutoQAAgentPerformanceHeatmapSwitchMock).toHaveBeenCalled()
        expect(screen.getByText('FiltersHeaderMock')).toBeTruthy()
    })
})
