import React from 'react'

import {useIsConvertPerformanceViewEnabled} from 'pages/convert/common/hooks/useIsConvertPerformanceViewEnabled'

import DashboardSection from 'pages/stats/DashboardSection'
import {CampaignTotalsStat} from 'pages/stats/convert/components/CampaignTotalsStat'
import {CampaignRevenueShareStat} from 'pages/stats/convert/components/CampaignRevenueShareStat'
import CampaignRevenueChart from 'pages/stats/convert/components/CampaignRevenueChart'
import {CampaignPerformanceTable} from 'pages/stats/convert/containers/CampaignPerformanceTable'

export const RevenueStatsContent = () => {
    const isConvertPerformanceViewEnabled = useIsConvertPerformanceViewEnabled()

    return (
        <DashboardSection title="">
            <CampaignTotalsStat />
            {isConvertPerformanceViewEnabled ? (
                <CampaignRevenueChart />
            ) : (
                <CampaignRevenueShareStat />
            )}
            <CampaignPerformanceTable />
        </DashboardSection>
    )
}
