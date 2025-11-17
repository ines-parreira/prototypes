import type { CampaignTableKeys } from 'domains/reporting/pages/convert/types/enums/CampaignTableKeys.enum'
import type { CampaignTableValueFormat } from 'domains/reporting/pages/convert/types/enums/CampaignTableValueFormat.enum'
import type { TooltipData } from 'domains/reporting/pages/types'

export interface CampaignTableColumn {
    className?: string
    format?: CampaignTableValueFormat
    key: CampaignTableKeys
    title: string
    hint?: TooltipData
}
