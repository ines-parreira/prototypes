import type { ComponentProps } from 'react'
import React from 'react'

import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import type FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { AccuracyTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/AccuracyTrendCard'
import AutoQA from 'domains/reporting/pages/support-performance/auto-qa/AutoQA'
import { AutoQAAgentPerformanceHeatmapSwitch } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentPerformanceHeatmapSwitch'
import { AutoQAAgentsTable } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTable'
import { AutoQADownloadDataButton } from 'domains/reporting/pages/support-performance/auto-qa/AutoQADownloadDataButton'
import {
    AUTO_QA_OPTIONAL_FILTERS,
    AUTO_QA_PAGE_TITLE,
} from 'domains/reporting/pages/support-performance/auto-qa/AutoQAReportConfig'
import { BrandVoiceTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/BrandVoiceTrendCard'
import { CommunicationSkillsTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/CommunicationSkillsTrendCard'
import { EfficiencyTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/EfficiencyTrendCard'
import { InternalComplianceTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/InternalComplianceTrendCard'
import { LanguageProficiencyTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/LanguageProficiencyTrendCard'
import { ResolutionCompletenessTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/ResolutionCompletenessTrendCard'
import { ReviewedClosedTicketsTrendCard } from 'domains/reporting/pages/support-performance/auto-qa/ReviewedClosedTicketsTrendCard'
import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    AUTOMATION_PRODUCT_ID,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

jest.mock(
    'domains/reporting/pages/common/drill-down/DrillDownModal.tsx',
    () => ({
        DrillDownModal: () => null,
    }),
)

jest.mock(
    'domains/reporting/pages/support-performance/auto-qa/ReviewedClosedTicketsTrendCard',
)
const NumberOfClosedTicketsReviewedTrendCardMock = assumeMock(
    ReviewedClosedTicketsTrendCard,
)
jest.mock(
    'domains/reporting/pages/support-performance/auto-qa/ResolutionCompletenessTrendCard',
)
const ResolutionCompletenessTrendCardMock = assumeMock(
    ResolutionCompletenessTrendCard,
)
jest.mock(
    'domains/reporting/pages/support-performance/auto-qa/CommunicationSkillsTrendCard',
)
const CommunicationSkillsTrendCardMock = assumeMock(
    CommunicationSkillsTrendCard,
)
jest.mock(
    'domains/reporting/pages/support-performance/auto-qa/LanguageProficiencyTrendCard',
)
const LanguageProficiencyTrendCardMock = assumeMock(
    LanguageProficiencyTrendCard,
)
jest.mock(
    'domains/reporting/pages/support-performance/auto-qa/AccuracyTrendCard',
)
const AccuracyTrendCardMock = assumeMock(AccuracyTrendCard)
jest.mock(
    'domains/reporting/pages/support-performance/auto-qa/EfficiencyTrendCard',
)
const EfficiencyTrendCardMock = assumeMock(EfficiencyTrendCard)
jest.mock(
    'domains/reporting/pages/support-performance/auto-qa/InternalComplianceTrendCard',
)
const InternalComplianceTrendCardMock = assumeMock(InternalComplianceTrendCard)
jest.mock(
    'domains/reporting/pages/support-performance/auto-qa/BrandVoiceTrendCard',
)
const BrandVoiceTrendCardMock = assumeMock(BrandVoiceTrendCard)
jest.mock(
    'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTable',
)
const AutoQAAgentsTableMock = assumeMock(AutoQAAgentsTable)
jest.mock(
    'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentPerformanceHeatmapSwitch',
)
const AutoQAAgentPerformanceHeatmapSwitchMock = assumeMock(
    AutoQAAgentPerformanceHeatmapSwitch,
)
jest.mock(
    'domains/reporting/pages/support-performance/auto-qa/AutoQADownloadDataButton',
)
const AutoQADownloadButtonMock = assumeMock(AutoQADownloadDataButton)
jest.mock('domains/reporting/hooks/useCleanStatsFilters')
const useCleanStatsFiltersMock = assumeMock(useCleanStatsFilters)
jest.mock(
    'domains/reporting/pages/common/filters/FiltersPanelWrapper',
    () => (props: ComponentProps<typeof FiltersPanelWrapper>) => {
        return props.optionalFilters?.map((optionalFilter) => (
            <div key={optionalFilter}>{optionalFilter}</div>
        ))
    },
)
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)

describe('AutoQA', () => {
    const componentMock = () => <div />
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

    beforeEach(() => {
        useReportChartRestrictionsMock.mockReturnValue({
            isChartRestrictedToCurrentUser: () => false,
        } as any)
        NumberOfClosedTicketsReviewedTrendCardMock.mockImplementation(() => (
            <div />
        ))
        ResolutionCompletenessTrendCardMock.mockImplementation(() => <div />)
        CommunicationSkillsTrendCardMock.mockImplementation(() => <div />)
        LanguageProficiencyTrendCardMock.mockImplementation(componentMock)
        AccuracyTrendCardMock.mockImplementation(componentMock)
        EfficiencyTrendCardMock.mockImplementation(componentMock)
        InternalComplianceTrendCardMock.mockImplementation(componentMock)
        BrandVoiceTrendCardMock.mockImplementation(componentMock)
        AutoQAAgentsTableMock.mockImplementation(componentMock)
        AutoQAAgentPerformanceHeatmapSwitchMock.mockImplementation(
            componentMock,
        )
        AutoQADownloadButtonMock.mockImplementation(componentMock)
        ChartsActionMenuMock.mockImplementation(componentMock)
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

    it('should render AutoQA page with optional filters and Auto QA dimensions filters added', () => {
        const extendedAutoQAFilters = [...AUTO_QA_OPTIONAL_FILTERS]

        renderWithStore(<AutoQA />, state)

        expect(screen.getByText(AUTO_QA_PAGE_TITLE)).toBeInTheDocument()
        extendedAutoQAFilters.forEach((optionalFilter) => {
            expect(screen.getByText(optionalFilter)).toBeTruthy()
        })
        expect(useCleanStatsFiltersMock).toHaveBeenCalled()
    })
})
