import React from 'react'
import {CampaignTotalsStat} from 'pages/stats/revenue/components/CampaignTotalsStat'

export const RevenueStatsContent = () => {
    const handleError = (error: Error) => {
        console.error(error)
    }

    return (
        <div>
            <CampaignTotalsStat onError={handleError} />
        </div>
    )
}
