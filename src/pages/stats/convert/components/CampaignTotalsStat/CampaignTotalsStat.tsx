import React from 'react'

import {
    CampaignsLegacyChart,
    CampaignsLegacyReportConfig,
} from 'pages/stats/convert/campaigns/CampaignsLegacyReportConfig'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'

const FIRST_ROW_SIZE = 6
const GRID_SIZE = 4

// Deprecated: it will be deleted soon
export const CampaignTotalsStat = () => {
    return (
        <React.Fragment>
            <DashboardGridCell size={FIRST_ROW_SIZE}>
                <DashboardComponent
                    config={CampaignsLegacyReportConfig}
                    chart={CampaignsLegacyChart.CampaignRevenueKPIChart}
                />
            </DashboardGridCell>
            <DashboardGridCell size={FIRST_ROW_SIZE}>
                <DashboardComponent
                    config={CampaignsLegacyReportConfig}
                    chart={CampaignsLegacyChart.InfluencedRevenueShareKPIChart}
                />
            </DashboardGridCell>
            <DashboardGridCell size={GRID_SIZE}>
                <DashboardComponent
                    config={CampaignsLegacyReportConfig}
                    chart={CampaignsLegacyChart.ImpressionsKPIChart}
                />
            </DashboardGridCell>
            <DashboardGridCell size={GRID_SIZE}>
                <DashboardComponent
                    config={CampaignsLegacyReportConfig}
                    chart={CampaignsLegacyChart.EngagementKPIChart}
                />
            </DashboardGridCell>
            <DashboardGridCell size={GRID_SIZE}>
                <DashboardComponent
                    config={CampaignsLegacyReportConfig}
                    chart={CampaignsLegacyChart.CampaignsSalesCountKPIChart}
                />
            </DashboardGridCell>
        </React.Fragment>
    )
}
