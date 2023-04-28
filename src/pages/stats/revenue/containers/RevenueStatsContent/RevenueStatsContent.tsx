import React from 'react'

import DashboardSection from 'pages/stats/DashboardSection'

import {CampaignTotalsStat} from 'pages/stats/revenue/components/CampaignTotalsStat'
import {CampaignPerformanceTable} from '../CampaignPerformanceTable'

export const RevenueStatsContent = () => {
    return (
        <DashboardSection title="">
            <CampaignTotalsStat />
            <CampaignPerformanceTable />
        </DashboardSection>
    )
}
