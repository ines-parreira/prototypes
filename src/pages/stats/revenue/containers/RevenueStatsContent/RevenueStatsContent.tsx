import React from 'react'

import {useFlags} from 'launchdarkly-react-client-sdk'
import DashboardSection from 'pages/stats/DashboardSection'

import {CampaignTotalsStat} from 'pages/stats/revenue/components/CampaignTotalsStat'
import {CampaignRevenueUpliftStat} from 'pages/stats/revenue/components/CampaignRevenueUpliftStat'
import {FeatureFlagKey} from 'config/featureFlags'
import {CampaignPerformanceTable} from '../CampaignPerformanceTable'

export const RevenueStatsContent = () => {
    const isRevenueUpliftChartHidden = Boolean(
        useFlags()[FeatureFlagKey.RevenueAttributionHideUpliftChart]
    )

    return (
        <DashboardSection title="">
            <CampaignTotalsStat />
            {!isRevenueUpliftChartHidden && <CampaignRevenueUpliftStat />}
            <CampaignPerformanceTable />
        </DashboardSection>
    )
}
