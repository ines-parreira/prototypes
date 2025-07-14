import { useContext } from 'react'

import { FiltersContext } from 'domains/reporting/pages/convert/providers/CampaignStatsFilters'

export function useCampaignStatsFilters() {
    return useContext(FiltersContext)
}
