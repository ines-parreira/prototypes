import { useContext } from 'react'

import { CampaignDetailsFormContext } from '../providers/CampaignDetailsForm/context'

export function useCampaignDetailsContext() {
    return useContext(CampaignDetailsFormContext)
}
