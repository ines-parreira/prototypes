import React from 'react'

import {useIsConvertPerformanceViewEnabled} from 'pages/convert/common/hooks/useIsConvertPerformanceViewEnabled'
import {
    CampaignsLegacyChart,
    CampaignsLegacyReportConfig,
} from 'pages/stats/convert/campaigns/CampaignsLegacyReportConfig'
import {
    CampaignsChart,
    CampaignsPerformanceReportConfig,
} from 'pages/stats/convert/campaigns/CampaignsPerformanceReportConfig'

import CampaignPerformanceCharts from 'pages/stats/convert/components/CampaignPerformanceCharts'
import {CampaignTotalsStat} from 'pages/stats/convert/components/CampaignTotalsStat'
import {CustomReportComponent} from 'pages/stats/custom-reports/CustomReportComponent'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'

export const RevenueStatsContent = () => {
    const isConvertPerformanceViewEnabled = useIsConvertPerformanceViewEnabled()

    if (isConvertPerformanceViewEnabled) {
        // New page layout and new charts
        return (
            <>
                <CampaignPerformanceCharts />
                <DashboardSection title="">
                    <DashboardGridCell size={12}>
                        <CustomReportComponent
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
                <CustomReportComponent
                    config={CampaignsLegacyReportConfig}
                    chart={CampaignsLegacyChart.CampaignRevenueShareStat}
                />
            </DashboardGridCell>
            <DashboardGridCell size={12}>
                <CustomReportComponent
                    config={CampaignsPerformanceReportConfig}
                    chart={CampaignsChart.CampaignPerformanceTable}
                />
            </DashboardGridCell>
        </DashboardSection>
    )
}
