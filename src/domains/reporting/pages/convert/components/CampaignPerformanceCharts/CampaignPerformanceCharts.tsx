import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import {
    CampaignsChart,
    CampaignsPerformanceReportConfig,
} from 'domains/reporting/pages/convert/campaigns/CampaignsPerformanceReportConfig'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { useGridSize } from 'hooks/useGridSize'

const CampaignPerformanceCharts = () => {
    const getGridCellSize = useGridSize()
    return (
        <>
            <DashboardSection title="Revenue Performance">
                <DashboardGridCell size={getGridCellSize(6)}>
                    <DashboardComponent
                        config={CampaignsPerformanceReportConfig}
                        chart={CampaignsChart.RevenueKpiChart}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <DashboardComponent
                        config={CampaignsPerformanceReportConfig}
                        chart={
                            CampaignsChart.PerformanceInfluencedRevenueShareKpiChart
                        }
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(12)}>
                    <DashboardComponent
                        config={CampaignsPerformanceReportConfig}
                        chart={CampaignsChart.CampaignRevenueChart}
                    />
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection title="Campaign Performance">
                <DashboardGridCell size={getGridCellSize(4)}>
                    <DashboardComponent
                        config={CampaignsPerformanceReportConfig}
                        chart={CampaignsChart.PerformanceImpressionsKpiChart}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(4)}>
                    <DashboardComponent
                        config={CampaignsPerformanceReportConfig}
                        chart={CampaignsChart.PerformanceEngagementKpiChart}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(4)}>
                    <DashboardComponent
                        config={CampaignsPerformanceReportConfig}
                        chart={CampaignsChart.PerformanceCampaignSalesKpiChart}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <DashboardComponent
                        config={CampaignsPerformanceReportConfig}
                        chart={CampaignsChart.PerformanceImpressionsGraphChart}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <DashboardComponent
                        config={CampaignsPerformanceReportConfig}
                        chart={
                            CampaignsChart.PerformanceCampaignSalesGraphChart
                        }
                    />
                </DashboardGridCell>
            </DashboardSection>
        </>
    )
}

export default CampaignPerformanceCharts
