import {GorgiasChatIntegration} from 'models/integration/types'
import {CampaignPreview} from 'models/convert/campaign/types'

export interface CampaignTableContentCell {
    campaign: CampaignPreview
    chatIntegration?: GorgiasChatIntegration
    currency: string
    metrics: Record<string, string | number>
}
