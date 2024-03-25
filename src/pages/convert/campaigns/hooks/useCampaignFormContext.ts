import {useContext} from 'react'

import {CampaignFormConfigurationContext} from 'pages/convert/campaigns/providers/CampaignDetailsForm/configurationContext'

export function useCampaignFormContext() {
    return useContext(CampaignFormConfigurationContext)
}
