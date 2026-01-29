import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'

import { useRestrictedReportsConfig } from 'domains/reporting/hooks/dashboards/useRestrictedReportsConfig'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { VoiceServiceLevelAgreementsChart } from 'domains/reporting/pages/sla/voice/VoiceServiceLevelAgreementsReportConfig'
import { SupportPerformanceAgentsReportConfig } from 'domains/reporting/pages/support-performance/agents/SupportPerformanceAgentsReportConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'

jest.mock('@repo/feature-flags')
const mockUseFlag = jest.mocked(useFlag)

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

describe('useRestrictedReportsConfig', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockImplementation((flag: string) => {
            if (flag === FeatureFlagKey.VoiceSLA) return true
        })
    })

    it('should restrict reports', () => {
        const restrictedReport = SupportPerformanceOverviewReportConfig
        useReportChartRestrictionsMock.mockReturnValue({
            isReportRestrictedToCurrentUser: (reportId) =>
                reportId === restrictedReport.id,
            isRouteRestrictedToCurrentUser: () => false,
            isChartRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        })

        const { result } = renderHook(() => useRestrictedReportsConfig())

        const supportPerformanceSection = result.current.find(
            (section) => section.category === 'Support Performance',
        )
        expect(supportPerformanceSection).toBeTruthy()
        expect(supportPerformanceSection?.children).not.toContainEqual(
            expect.objectContaining({
                config: restrictedReport,
            }),
        )
        expect(supportPerformanceSection?.children).toContainEqual(
            expect.objectContaining({
                config: SupportPerformanceAgentsReportConfig,
            }),
        )
    })

    it('should restrict all charts in section', () => {
        const restrictedReports = [
            ReportsIDs.AiAgentAnalyticsOverview,
            ReportsIDs.AutomateOverviewReportConfig,
            ReportsIDs.AiSalesAgentReportConfig,
            ReportsIDs.AutomateAiAgentsReportConfig,
            ReportsIDs.AutomatePerformanceByFeatureReportConfig,
        ]
        useReportChartRestrictionsMock.mockReturnValue({
            isReportRestrictedToCurrentUser: (reportId) =>
                restrictedReports.includes(reportId),
            isRouteRestrictedToCurrentUser: () => false,
            isChartRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        })

        const { result } = renderHook(() => useRestrictedReportsConfig())

        const aiAgentSection = result.current.find(
            (section) => section.category === 'AI Agent',
        )
        expect(aiAgentSection).toBeTruthy()
        expect(aiAgentSection?.children).toEqual([])
    })

    it('should restrict charts', () => {
        const restrictedChart = OverviewChart.CustomerSatisfactionTrendCard
        useReportChartRestrictionsMock.mockReturnValue({
            isReportRestrictedToCurrentUser: () => false,
            isRouteRestrictedToCurrentUser: () => false,
            isChartRestrictedToCurrentUser: (chartId) =>
                chartId === restrictedChart,
            isModuleRestrictedToCurrentUser: () => false,
        })

        const { result } = renderHook(() => useRestrictedReportsConfig())

        const supportPerformanceSection = result.current.find(
            (section) => section.category === 'Support Performance',
        )
        const overviewReport = supportPerformanceSection?.children.find(
            (report) =>
                report.config.id ===
                ReportsIDs.SupportPerformanceOverviewReportConfig,
        )
        expect(overviewReport).toBeTruthy()
        expect(overviewReport?.config.charts[restrictedChart]).toBeUndefined()
        expect(
            overviewReport?.config.charts[
                OverviewChart.MedianFirstResponseTimeTrendCard
            ],
        ).toBeTruthy()
    })

    it('should filter out voice SLA report when VoiceSLA feature flag is disabled', () => {
        mockUseFlag.mockImplementation((flag: string) => {
            if (flag === FeatureFlagKey.VoiceSLA) return false
            return false
        })

        useReportChartRestrictionsMock.mockReturnValue({
            isReportRestrictedToCurrentUser: () => false,
            isRouteRestrictedToCurrentUser: () => false,
            isChartRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        })

        const { result } = renderHook(() => useRestrictedReportsConfig())

        const supportPerformanceSection = result.current.find(
            (section) => section.category === 'Support Performance',
        )

        expect(supportPerformanceSection).toBeTruthy()
        expect(supportPerformanceSection?.children).not.toContainEqual(
            expect.objectContaining({
                type: VoiceServiceLevelAgreementsChart,
            }),
        )
    })

    it('should include voice SLA report when VoiceSLA feature flag is enabled', () => {
        mockUseFlag.mockImplementation((flag: string) => {
            if (flag === FeatureFlagKey.VoiceSLA) return true
            return false
        })

        useReportChartRestrictionsMock.mockReturnValue({
            isReportRestrictedToCurrentUser: () => false,
            isRouteRestrictedToCurrentUser: () => false,
            isChartRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        })

        const { result } = renderHook(() => useRestrictedReportsConfig())

        const supportPerformanceSection = result.current.find(
            (section) => section.category === 'Support Performance',
        )

        expect(supportPerformanceSection).toBeTruthy()
        expect(supportPerformanceSection?.children).toContainEqual(
            expect.objectContaining({
                type: VoiceServiceLevelAgreementsChart,
            }),
        )
    })
})
