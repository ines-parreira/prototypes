import {screen} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'

import React, {ComponentProps} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {FilterKey} from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import AutoQA, {
    AUTO_QA_OPTIONAL_FILTERS,
    AUTO_QA_PAGE_TITLE,
} from 'pages/stats/support-performance/auto-qa/AutoQA'
import {AutoQAAgentPerformanceHeatmapSwitch} from 'pages/stats/support-performance/auto-qa/AutoQAAgentPerformanceHeatmapSwitch'
import {AutoQAAgentsTable} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTable'
import {AutoQADownloadDataButton} from 'pages/stats/support-performance/auto-qa/AutoQADownloadDataButton'
import {CommunicationSkillsTrendCard} from 'pages/stats/support-performance/auto-qa/CommunicationSkillsTrendCard'
import {ResolutionCompletenessTrendCard} from 'pages/stats/support-performance/auto-qa/ResolutionCompletenessTrendCard'
import {ReviewedClosedTicketsTrendCard} from 'pages/stats/support-performance/auto-qa/ReviewedClosedTicketsTrendCard'
import {assumeMock, renderWithStore} from 'utils/testing'

const componentMock = () => <div />

jest.mock('pages/stats/SupportPerformanceFilters', () => ({
    SupportPerformanceFilters: componentMock,
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

jest.mock(
    'pages/stats/common/filters/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    }
)

describe('AutoQA', () => {
    beforeEach(() => {
        NumberOfClosedTicketsReviewedTrendCardMock.mockImplementation(
            componentMock
        )
        ResolutionCompletenessTrendCardMock.mockImplementation(componentMock)
        CommunicationSkillsTrendCardMock.mockImplementation(componentMock)
        AutoQAAgentsTableMock.mockImplementation(componentMock)
        AutoQAAgentPerformanceHeatmapSwitchMock.mockImplementation(
            componentMock
        )
        AutoQADownloadButtonMock.mockImplementation(componentMock)
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
        mockFlags({
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
        AUTO_QA_OPTIONAL_FILTERS.forEach((optionalFilter) => {
            expect(screen.getByText(optionalFilter)).toBeTruthy()
        })
    })

    it('should render AutoQA page with optional filters and Score filter added', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
            [FeatureFlagKey.AnalyticsNewCSATFilter]: true,
        })
        const extendedAutoQAFilters = [
            ...AUTO_QA_OPTIONAL_FILTERS,
            FilterKey.Score,
        ]

        renderWithStore(<AutoQA />, {})

        expect(screen.getByText(AUTO_QA_PAGE_TITLE)).toBeInTheDocument()
        extendedAutoQAFilters.forEach((optionalFilter) => {
            expect(screen.getByText(optionalFilter)).toBeTruthy()
        })
    })
})
