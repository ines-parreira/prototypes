import { createContext } from 'react'

import { CampaignPreview } from 'models/convert/campaign/types'
import { Integration } from 'models/integration/types'
import { ReportingGranularity } from 'models/reporting/types'
import {
    AggregationWindow,
    Period,
    WithLogicalOperator,
} from 'models/stat/types'
import { Value } from 'pages/common/forms/SelectField/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'

interface FilterContextSchema {
    campaigns: CampaignPreview[]
    integrations: Integration[]
    isStorePreSelected: boolean
    selectedCampaignIds: string[] | null
    selectedCampaigns: string[]
    selectedCampaignStatuses: string[]
    selectedIntegrations: number[]
    selectedPeriod: Period
    channelConnectionExternalIds: string[]
    onChangeIntegration: (integrationIds: Value[]) => void
    onChangeCampaigns: (
        integrationIds: Value[] | WithLogicalOperator<string>,
    ) => void
    onChangeCampaignsByStatus: (
        statuses: Value[] | WithLogicalOperator<string>,
    ) => void
    selectedCampaignsOperator: LogicalOperatorEnum
    granularity: AggregationWindow
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
    granularity: ReportingGranularity.Day,
})
