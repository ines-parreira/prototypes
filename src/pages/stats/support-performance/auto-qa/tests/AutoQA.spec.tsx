import {screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'

import React, {ComponentProps} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import {FilterKey} from 'models/stat/types'
import {AUTO_QA_FILTER_KEYS} from 'pages/stats/common/filters/constants'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import {useReportChartRestrictions} from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import {AccuracyTrendCard} from 'pages/stats/support-performance/auto-qa/AccuracyTrendCard'
import AutoQA from 'pages/stats/support-performance/auto-qa/AutoQA'
import {AutoQAAgentPerformanceHeatmapSwitch} from 'pages/stats/support-performance/auto-qa/AutoQAAgentPerformanceHeatmapSwitch'
import {AutoQAAgentsTable} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTable'
import {AutoQADownloadDataButton} from 'pages/stats/support-performance/auto-qa/AutoQADownloadDataButton'
import {
    AUTO_QA_OPTIONAL_FILTERS,
    AUTO_QA_PAGE_TITLE,
} from 'pages/stats/support-performance/auto-qa/AutoQAReportConfig'
import {BrandVoiceTrendCard} from 'pages/stats/support-performance/auto-qa/BrandVoiceTrendCard'
import {CommunicationSkillsTrendCard} from 'pages/stats/support-performance/auto-qa/CommunicationSkillsTrendCard'
import {EfficiencyTrendCard} from 'pages/stats/support-performance/auto-qa/EfficiencyTrendCard'
import {InternalComplianceTrendCard} from 'pages/stats/support-performance/auto-qa/InternalComplianceTrendCard'
import {LanguageProficiencyTrendCard} from 'pages/stats/support-performance/auto-qa/LanguageProficiencyTrendCard'
import {ResolutionCompletenessTrendCard} from 'pages/stats/support-performance/auto-qa/ResolutionCompletenessTrendCard'
import {ReviewedClosedTicketsTrendCard} from 'pages/stats/support-performance/auto-qa/ReviewedClosedTicketsTrendCard'
import {RootState} from 'state/types'
import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('pages/stats/report-chart-restrictions/useReportChartRestrictions')
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

const componentMock = () => <div />

jest.mock('pages/stats/support-performance/SupportPerformanceFilters', () => ({
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
jest.mock(
    'pages/stats/support-performance/auto-qa/LanguageProficiencyTrendCard'
)
const LanguageProficiencyTrendCardMock = assumeMock(
    LanguageProficiencyTrendCard
)
jest.mock('pages/stats/support-performance/auto-qa/AccuracyTrendCard')
const AccuracyTrendCardMock = assumeMock(AccuracyTrendCard)
jest.mock('pages/stats/support-performance/auto-qa/EfficiencyTrendCard')
const EfficiencyTrendCardMock = assumeMock(EfficiencyTrendCard)
jest.mock('pages/stats/support-performance/auto-qa/InternalComplianceTrendCard')
const InternalComplianceTrendCardMock = assumeMock(InternalComplianceTrendCard)
jest.mock('pages/stats/support-performance/auto-qa/BrandVoiceTrendCard')
const BrandVoiceTrendCardMock = assumeMock(BrandVoiceTrendCard)
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

const state = {
    billing: fromJS(billingState),
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: basicYearlyHelpdeskPlan.price_id,
                [AUTOMATION_PRODUCT_ID]: basicYearlyAutomationPlan.price_id,
            },
            status: 'active',
        },
    }),
} as RootState

describe('AutoQA', () => {
    beforeEach(() => {
        useReportChartRestrictionsMock.mockReturnValue({
            isChartRestrictedToCurrentUser: () => false,
        } as any)

        NumberOfClosedTicketsReviewedTrendCardMock.mockImplementation(
            componentMock
        )
        ResolutionCompletenessTrendCardMock.mockImplementation(componentMock)
        CommunicationSkillsTrendCardMock.mockImplementation(componentMock)
        LanguageProficiencyTrendCardMock.mockImplementation(componentMock)
        AccuracyTrendCardMock.mockImplementation(componentMock)
        EfficiencyTrendCardMock.mockImplementation(componentMock)
        InternalComplianceTrendCardMock.mockImplementation(componentMock)
        BrandVoiceTrendCardMock.mockImplementation(componentMock)
        AutoQAAgentsTableMock.mockImplementation(componentMock)
        AutoQAAgentPerformanceHeatmapSwitchMock.mockImplementation(
            componentMock
        )
        AutoQADownloadButtonMock.mockImplementation(componentMock)
    })

    it('should render page title', () => {
        renderWithStore(<AutoQA />, state)

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
        renderWithStore(<AutoQA />, state)

        expect(screen.getByText(AUTO_QA_PAGE_TITLE)).toBeInTheDocument()
        expect(NumberOfClosedTicketsReviewedTrendCardMock).toHaveBeenCalled()
        expect(ResolutionCompletenessTrendCardMock).toHaveBeenCalled()
        expect(CommunicationSkillsTrendCardMock).toHaveBeenCalled()
        expect(LanguageProficiencyTrendCardMock).toHaveBeenCalled()
        expect(AccuracyTrendCardMock).toHaveBeenCalled()
        expect(EfficiencyTrendCardMock).toHaveBeenCalled()
        expect(InternalComplianceTrendCardMock).toHaveBeenCalled()
        expect(BrandVoiceTrendCardMock).toHaveBeenCalled()
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

        renderWithStore(<AutoQA />, state)

        expect(screen.getByText(AUTO_QA_PAGE_TITLE)).toBeInTheDocument()
        extendedAutoQAFilters.forEach((optionalFilter) => {
            expect(screen.getByText(optionalFilter)).toBeTruthy()
        })
    })

    it('should render AutoQA page with optional filters and Auto QA dimensions filters added', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
            [FeatureFlagKey.AutoQAFilters]: true,
        })
        const extendedAutoQAFilters = [
            ...AUTO_QA_OPTIONAL_FILTERS,
            ...AUTO_QA_FILTER_KEYS,
        ]

        renderWithStore(<AutoQA />, state)

        expect(screen.getByText(AUTO_QA_PAGE_TITLE)).toBeInTheDocument()
        extendedAutoQAFilters.forEach((optionalFilter) => {
            expect(screen.getByText(optionalFilter)).toBeTruthy()
        })
    })
})
