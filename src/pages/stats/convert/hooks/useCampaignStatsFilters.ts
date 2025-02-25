import { useContext } from 'react'

import { FiltersContext } from '../providers/CampaignStatsFilters'

export function useCampaignStatsFilters() {
    return useContext(FiltersContext)
}
