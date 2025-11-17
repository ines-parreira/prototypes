import { useContext } from 'react'

import type { CampaignListOptionsContextSchema } from '../providers/CampaignListOptions'
import { CampaignListOptionsContext } from '../providers/CampaignListOptions'

export function useCampaignListOptions(): CampaignListOptionsContextSchema {
    return useContext(CampaignListOptionsContext)
}
