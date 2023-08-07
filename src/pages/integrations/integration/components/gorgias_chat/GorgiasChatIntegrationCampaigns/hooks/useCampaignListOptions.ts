import {useContext} from 'react'

import {
    CampaignListOptionsContext,
    CampaignListOptionsContextSchema,
} from '../providers/CampaignListOptions'

export function useCampaignListOptions(): CampaignListOptionsContextSchema {
    return useContext(CampaignListOptionsContext)
}
