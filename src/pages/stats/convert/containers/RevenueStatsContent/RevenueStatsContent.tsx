import { useIsConvertPerformanceViewEnabled } from 'pages/convert/common/hooks/useIsConvertPerformanceViewEnabled'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import {
    CampaignsLegacyChart,
    CampaignsLegacyReportConfig,
} from 'pages/stats/convert/campaigns/CampaignsLegacyReportConfig'
import {
    CampaignsChart,
    CampaignsPerformanceReportConfig,
} from 'pages/stats/convert/campaigns/CampaignsPerformanceReportConfig'
import CampaignPerformanceCharts from 'pages/stats/convert/components/CampaignPerformanceCharts'
import { CampaignTotalsStat } from 'pages/stats/convert/components/CampaignTotalsStat'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'

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
