import {createContext} from 'react'

import {Integration} from 'models/integration/types'
import {Value} from 'pages/common/forms/SelectField/types'
import {CampaignPreview} from 'models/convert/campaign/types'
import {WithLogicalOperator} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

interface FilterContextSchema {
    campaigns: CampaignPreview[]
    integrations: Integration[]
    isStorePreSelected: boolean
    selectedCampaignIds: string[] | null
    selectedCampaigns: string[]
    selectedCampaignStatuses: string[]
    selectedIntegrations: number[]
    selectedPeriod: {
        end_datetime: string
        start_datetime: string
    }
    channelConnectionExternalIds: string[]
    onChangeIntegration: (integrationIds: Value[]) => void
    onChangeCampaigns: (
        integrationIds: Value[] | WithLogicalOperator<string>
    ) => void
    onChangeCampaignsByStatus: (
        statuses: Value[] | WithLogicalOperator<string>
    ) => void
    selectedCampaignsOperator: LogicalOperatorEnum
}

export const FiltersContext = createContext<FilterContextSchema>({
    campaigns: [],
    integrations: [],
    isStorePreSelected: false,
    selectedCampaignIds: [],
    selectedCampaigns: [],
    selectedCampaignStatuses: [],
    selectedIntegrations: [],
    selectedPeriod: {
        end_datetime: '',
        start_datetime: '',
    },
    channelConnectionExternalIds: [],
    onChangeIntegration: () => null,
    onChangeCampaigns: () => null,
    onChangeCampaignsByStatus: () => null,
    selectedCampaignsOperator: LogicalOperatorEnum.ONE_OF,
})
