import { ABGroup } from 'models/convert/campaign/types'
import { CampaignVariant } from 'pages/convert/campaigns/types/CampaignVariant'

export type VariantTableEntry = {
    variant: CampaignVariant | null // control version is marked as null
    abGroup: ABGroup
    isWinner: boolean
    variantName: string
    link: string
    trafficAllocation: number
    canDelete: boolean
    metrics: Record<string, string | number>
}
