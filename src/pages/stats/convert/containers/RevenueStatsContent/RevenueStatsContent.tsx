import React from 'react'

import {useIsConvertPerformanceViewEnabled} from 'pages/convert/common/hooks/useIsConvertPerformanceViewEnabled'

import CampaignPerformanceCharts from 'pages/stats/convert/components/CampaignPerformanceCharts'
import {CampaignRevenueShareStat} from 'pages/stats/convert/components/CampaignRevenueShareStat'
import {CampaignTotalsStat} from 'pages/stats/convert/components/CampaignTotalsStat'
import {CampaignPerformanceTable} from 'pages/stats/convert/containers/CampaignPerformanceTable'
import DashboardSection from 'pages/stats/DashboardSection'

export const RevenueStatsContent = () => {
    const isConvertPerformanceViewEnabled = useIsConvertPerformanceViewEnabled()

    if (isConvertPerformanceViewEnabled) {
        // New page layout and new charts
        return (
            <>
                <CampaignPerformanceCharts />
                <DashboardSection title="">
                    <CampaignPerformanceTable />
                </DashboardSection>
            </>
        )
    }

    return (
        <DashboardSection title="">
            <CampaignTotalsStat />
            <CampaignRevenueShareStat />
            <CampaignPerformanceTable />
        </DashboardSection>
    )
}
