import React from 'react'

import DashboardSection from 'pages/stats/DashboardSection'

import {CampaignTotalsStat} from 'pages/stats/convert/components/CampaignTotalsStat'
import {CampaignRevenueShareStat} from 'pages/stats/convert/components/CampaignRevenueShareStat'
import {CampaignPerformanceTable} from '../CampaignPerformanceTable'

export const RevenueStatsContent = () => {
    return (
        <DashboardSection title="">
            <CampaignTotalsStat />
            <CampaignRevenueShareStat />
            <CampaignPerformanceTable />
        </DashboardSection>
    )
}
