import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import type { ConvertMetric } from 'domains/reporting/state/ui/stats/types'
import type { CampaignPreview } from 'models/convert/campaign/types'
import type { GorgiasChatIntegration } from 'models/integration/types'

export interface CampaignTableContentCell {
    campaign: CampaignPreview
    chatIntegration?: GorgiasChatIntegration
    currency: string
    metrics: Record<string, string | number>
    variantMetrics: Record<string, Record<string, string | number>>
    drillDownMetricData: Record<ConvertMetric, DrillDownMetric>
}
