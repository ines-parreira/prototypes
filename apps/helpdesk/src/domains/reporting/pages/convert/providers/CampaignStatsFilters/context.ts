import { createContext } from 'react'

import type {
    AggregationWindow,
    Period,
    WithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import type { CampaignPreview } from 'models/convert/campaign/types'
import type { Integration } from 'models/integration/types'
import type { Value } from 'pages/common/forms/SelectField/types'

interface FilterContextSchema {
    campaigns: CampaignPreview[]
    storeIntegrations: Integration[]
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
    storeIntegrations: [],
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
