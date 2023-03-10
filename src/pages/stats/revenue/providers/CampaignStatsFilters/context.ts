import {createContext} from 'react'

import {Campaign, Integration} from 'models/integration/types'
import {Value} from 'pages/common/forms/SelectField/types'

interface FilterContextSchema {
    campaigns: Campaign[]
    integrations: Integration[]
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
    integrations: [],
    selectedCampaigns: [],
    selectedIntegrations: [],
    selectedPeriod: {
        end_datetime: '',
        start_datetime: '',
    },
    onChangeIntegration: () => null,
    onChangeCampaigns: () => null,
})
