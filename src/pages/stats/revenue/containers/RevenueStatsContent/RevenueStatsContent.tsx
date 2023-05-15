import React from 'react'

import DashboardSection from 'pages/stats/DashboardSection'

import {CampaignTotalsStat} from 'pages/stats/revenue/components/CampaignTotalsStat'
import {CampaignRevenueUpliftStat} from 'pages/stats/revenue/components/CampaignRevenueUpliftStat'
import {CampaignPerformanceTable} from '../CampaignPerformanceTable'

export const RevenueStatsContent = () => {
    return (
        <DashboardSection title="">
            <CampaignTotalsStat />
            <CampaignRevenueUpliftStat />
            <CampaignPerformanceTable />
        </DashboardSection>
    )
}
