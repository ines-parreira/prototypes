import React from 'react'
import {CampaignTotalsStat} from 'pages/stats/revenue/components/CampaignTotalsStat'
import {CampaignRevenueUpliftStat} from 'pages/stats/revenue/components/CampaignRevenueUpliftStat'
import {CampaignChatPerformanceStat} from 'pages/stats/revenue/components/CampaignChatPerformanceStat'

export const RevenueStatsContent = () => {
    const handleError = (error: Error) => {
        console.error(error)
    }

    return (
        <div>
            <CampaignTotalsStat onError={handleError} />
            <CampaignRevenueUpliftStat onError={handleError} />
            <CampaignChatPerformanceStat onError={handleError} />
        </div>
    )
}
