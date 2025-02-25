import { TooltipData } from 'pages/stats/types'

import { CampaignTableKeys } from './enums/CampaignTableKeys.enum'
import { CampaignTableValueFormat } from './enums/CampaignTableValueFormat.enum'

export interface CampaignTableColumn {
    className?: string
    format?: CampaignTableValueFormat
    key: CampaignTableKeys
    title: string
    hint?: TooltipData
}
