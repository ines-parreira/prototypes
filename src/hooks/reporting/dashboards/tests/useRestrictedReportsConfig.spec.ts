import { useReportRestrictions } from 'hooks/reporting/dashboards/useReportRestrictions'
import { useRestrictedReportsConfig } from 'hooks/reporting/dashboards/useRestrictedReportsConfig'
import { ReportsIDs } from 'pages/stats/dashboards/constants'
import { SupportPerformanceAgentsReportConfig } from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReportConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/dashboards/useReportRestrictions')
const useReportRestrictionsMock = assumeMock(useReportRestrictions)

describe('useRestrictedReportsConfig', () => {
    it('should restrict reports', () => {
        const restrictedReport = SupportPerformanceOverviewReportConfig
        useReportRestrictionsMock.mockReturnValue({
            reportRestrictionsMap: {
                [restrictedReport.id]: true,
            },
            chartRestrictionsMap: {},
            moduleRestrictionsMap: {},
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

    it('should restrict charts', () => {
        const restrictedChart = OverviewChart.CustomerSatisfactionTrendCard
        useReportRestrictionsMock.mockReturnValue({
            reportRestrictionsMap: {},
            chartRestrictionsMap: {
                [restrictedChart]: true,
            },
            moduleRestrictionsMap: {},
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
