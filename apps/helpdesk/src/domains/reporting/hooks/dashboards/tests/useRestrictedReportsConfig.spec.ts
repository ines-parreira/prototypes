import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
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
import { AnalyticsAiAgentAllAgentsReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'

jest.mock('@repo/feature-flags')
const mockUseFlagWithLoading = jest.mocked(useFlagWithLoading)

jest.mock(
    'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions',
)
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

const noRestrictions = {
    isReportRestrictedToCurrentUser: () => false,
    isRouteRestrictedToCurrentUser: () => false,
    isChartRestrictedToCurrentUser: () => false,
    isModuleRestrictedToCurrentUser: () => false,
}

describe('useRestrictedReportsConfig', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlagWithLoading.mockImplementation((flag: string) => {
            if (flag === FeatureFlagKey.VoiceSLA)
                return { value: true, isLoading: false }
            return { value: false, isLoading: false }
        })
        useReportChartRestrictionsMock.mockReturnValue(noRestrictions)
    })

    it('should restrict reports', () => {
        const restrictedReport = SupportPerformanceOverviewReportConfig
        useReportChartRestrictionsMock.mockReturnValue({
            ...noRestrictions,
            isReportRestrictedToCurrentUser: (reportId) =>
                reportId === restrictedReport.id,
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
            ...noRestrictions,
            isReportRestrictedToCurrentUser: (reportId) =>
                restrictedReports.includes(reportId),
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
            ...noRestrictions,
            isChartRestrictedToCurrentUser: (chartId) =>
                chartId === restrictedChart,
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
        mockUseFlagWithLoading.mockImplementation((flag: string) => {
            if (flag === FeatureFlagKey.VoiceSLA)
                return { value: false, isLoading: false }
            return { value: false, isLoading: false }
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
        mockUseFlagWithLoading.mockImplementation((flag: string) => {
            if (flag === FeatureFlagKey.VoiceSLA)
                return { value: true, isLoading: false }
            return { value: false, isLoading: false }
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

    it('should return AI Agent category when AiAgentAnalyticsCustomDashboards flag is disabled', () => {
        const { result } = renderHook(() => useRestrictedReportsConfig())

        const aiAgentSection = result.current.find(
            (section) => section.category === 'AI Agent',
        )
        expect(aiAgentSection).toBeTruthy()
        expect(
            result.current.find((s) => s.category === 'AI & automation'),
        ).toBeUndefined()
    })

    it('should return AI & automation category when AiAgentAnalyticsCustomDashboards flag is enabled', () => {
        mockUseFlagWithLoading.mockImplementation((flag: string) => {
            if (flag === FeatureFlagKey.AiAgentAnalyticsCustomDashboards)
                return { value: true, isLoading: false }
            return { value: false, isLoading: false }
        })

        const { result } = renderHook(() => useRestrictedReportsConfig())

        const aiAutomationSection = result.current.find(
            (section) => section.category === 'AI & automation',
        )
        expect(aiAutomationSection).toBeTruthy()
        expect(aiAutomationSection?.children).toContainEqual(
            expect.objectContaining({
                config: AnalyticsAiAgentAllAgentsReportConfig,
            }),
        )
        expect(
            result.current.find((s) => s.category === 'AI Agent'),
        ).toBeUndefined()
    })
})
