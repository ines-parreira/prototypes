import React from 'react'
import {CampaignTotalsStat} from 'pages/stats/revenue/components/CampaignTotalsStat'
import {CampaignRevenueUpliftStat} from 'pages/stats/revenue/components/CampaignRevenueUpliftStat'

export const RevenueStatsContent = () => {
    const handleError = (error: Error) => {
        console.error(error)
    }

    return (
        <div>
            <CampaignTotalsStat onError={handleError} />
            <CampaignRevenueUpliftStat onError={handleError} />
        </div>
    )
}
