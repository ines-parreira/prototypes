import {GorgiasChatIntegration} from 'models/integration/types'
import {CampaignPreview} from 'models/convert/campaign/types'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {ConvertMetric} from 'state/ui/stats/types'

export interface CampaignTableContentCell {
    campaign: CampaignPreview
    chatIntegration?: GorgiasChatIntegration
    currency: string
    metrics: Record<string, string | number>
    variantMetrics: Record<string, Record<string, string | number>>
    drillDownMetricData: Record<ConvertMetric, DrillDownMetric>
}
