import React from 'react'

import {CampaignTotalsStat} from 'pages/stats/revenue/components/CampaignTotalsStat'
import {CampaignRevenueUpliftStat} from 'pages/stats/revenue/components/CampaignRevenueUpliftStat'
import {CampaignChatPerformanceStat} from 'pages/stats/revenue/components/CampaignChatPerformanceStat'
import {CampaignPerformanceTable} from '../CampaignPerformanceTable'

export const RevenueStatsContent = () => {
    const handleError = (error: Error) => {
        console.error(error)
    }

    // TODO: temporary disable graphs for the initial release
    const graphsVisible = false

    return (
        <div>
            <CampaignTotalsStat onError={handleError} />
            {graphsVisible && (
                <CampaignRevenueUpliftStat onError={handleError} />
            )}
            {graphsVisible && (
                <CampaignChatPerformanceStat onError={handleError} />
            )}
            <CampaignPerformanceTable />
        </div>
    )
}
