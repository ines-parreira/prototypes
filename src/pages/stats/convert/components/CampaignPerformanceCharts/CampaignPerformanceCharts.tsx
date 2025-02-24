import React from 'react'

import {useGridSize} from 'hooks/useGridSize'
import {
    CampaignsChart,
    CampaignsPerformanceReportConfig,
} from 'pages/stats/convert/campaigns/CampaignsPerformanceReportConfig'
import {CustomReportComponent} from 'pages/stats/custom-reports/CustomReportComponent'

import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'

const CampaignPerformanceCharts = () => {
    const getGridCellSize = useGridSize()
    return (
        <>
            <DashboardSection title="Revenue Performance">
                <DashboardGridCell size={getGridCellSize(6)}>
                    <CustomReportComponent
                        config={CampaignsPerformanceReportConfig}
                        chart={CampaignsChart.RevenueKpiChart}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <CustomReportComponent
                        config={CampaignsPerformanceReportConfig}
                        chart={
                            CampaignsChart.PerformanceInfluencedRevenueShareKpiChart
                        }
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(12)}>
                    <CustomReportComponent
                        config={CampaignsPerformanceReportConfig}
                        chart={CampaignsChart.CampaignRevenueChart}
                    />
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection title="Campaign Performance">
                <DashboardGridCell size={getGridCellSize(4)}>
                    <CustomReportComponent
                        config={CampaignsPerformanceReportConfig}
                        chart={CampaignsChart.PerformanceImpressionsKpiChart}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(4)}>
                    <CustomReportComponent
                        config={CampaignsPerformanceReportConfig}
                        chart={CampaignsChart.PerformanceEngagementKpiChart}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(4)}>
                    <CustomReportComponent
                        config={CampaignsPerformanceReportConfig}
                        chart={CampaignsChart.PerformanceCampaignSalesKpiChart}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <CustomReportComponent
                        config={CampaignsPerformanceReportConfig}
                        chart={CampaignsChart.PerformanceImpressionsGraphChart}
                    />
                </DashboardGridCell>
                <DashboardGridCell size={getGridCellSize(6)}>
                    <CustomReportComponent
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
