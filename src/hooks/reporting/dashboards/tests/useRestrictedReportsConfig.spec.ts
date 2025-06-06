import { useRestrictedReportsConfig } from 'hooks/reporting/dashboards/useRestrictedReportsConfig'
import { ReportsIDs } from 'pages/stats/dashboards/constants'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { SupportPerformanceAgentsReportConfig } from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReportConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('pages/stats/report-chart-restrictions/useReportChartRestrictions')
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)

describe('useRestrictedReportsConfig', () => {
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
})
