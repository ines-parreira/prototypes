import React from 'react'
import {useCampaignStatsFilters} from '../../hooks/useCampaignStatsFilters'

export const RevenueStatsContent = () => {
    const {selectedCampaigns, selectedIntegrations, selectedPeriod} =
        useCampaignStatsFilters()

    return (
        <div>
            <ul>
                <li>Shopify stores: {JSON.stringify(selectedIntegrations)}</li>
                <li>Chat campaigns: {JSON.stringify(selectedCampaigns)}</li>
                <li>Period: {JSON.stringify(selectedPeriod)}</li>
            </ul>
        </div>
    )
}
