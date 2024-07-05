import {createContext} from 'react'

import {Integration} from 'models/integration/types'
import {Value} from 'pages/common/forms/SelectField/types'
import {CampaignPreview} from 'models/convert/campaign/types'

interface FilterContextSchema {
    campaigns: CampaignPreview[]
    allCampaigns: CampaignPreview[]
    integrations: Integration[]
    isStorePreSelected: boolean
    selectedCampaigns: string[]
    selectedIntegrations: number[]
    selectedPeriod: {
        end_datetime: string
        start_datetime: string
    }
    onChangeIntegration: (integrationIds: Value[]) => void
    onChangeCampaigns: (integrationIds: Value[]) => void
}

export const FiltersContext = createContext<FilterContextSchema>({
    campaigns: [],
    allCampaigns: [],
    integrations: [],
    isStorePreSelected: false,
    selectedCampaigns: [],
    selectedIntegrations: [],
    selectedPeriod: {
        end_datetime: '',
        start_datetime: '',
    },
    onChangeIntegration: () => null,
    onChangeCampaigns: () => null,
})
