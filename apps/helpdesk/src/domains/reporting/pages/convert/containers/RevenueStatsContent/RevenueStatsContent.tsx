import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import {
    CampaignsLegacyChart,
    CampaignsLegacyReportConfig,
} from 'domains/reporting/pages/convert/campaigns/CampaignsLegacyReportConfig'
import {
    CampaignsChart,
    CampaignsPerformanceReportConfig,
} from 'domains/reporting/pages/convert/campaigns/CampaignsPerformanceReportConfig'
import CampaignPerformanceCharts from 'domains/reporting/pages/convert/components/CampaignPerformanceCharts'
import { CampaignTotalsStat } from 'domains/reporting/pages/convert/components/CampaignTotalsStat'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { useIsConvertPerformanceViewEnabled } from 'pages/convert/common/hooks/useIsConvertPerformanceViewEnabled'

export const RevenueStatsContent = () => {
    const isConvertPerformanceViewEnabled = useIsConvertPerformanceViewEnabled()

    if (isConvertPerformanceViewEnabled) {
        // New page layout and new charts
        return (
            <>
                <CampaignPerformanceCharts />
                <DashboardSection title="">
                    <DashboardGridCell size={12}>
                        <DashboardComponent
                            config={CampaignsPerformanceReportConfig}
                            chart={CampaignsChart.CampaignPerformanceTable}
                        />
                    </DashboardGridCell>
                </DashboardSection>
            </>
        )
    }

    return (
        <DashboardSection title="">
            <CampaignTotalsStat />
            <DashboardGridCell size={12}>
                <DashboardComponent
                    config={CampaignsLegacyReportConfig}
                    chart={CampaignsLegacyChart.CampaignRevenueShareStat}
                />
            </DashboardGridCell>
            <DashboardGridCell size={12}>
                <DashboardComponent
                    config={CampaignsPerformanceReportConfig}
                    chart={CampaignsChart.CampaignPerformanceTable}
                />
            </DashboardGridCell>
        </DashboardSection>
    )
}
