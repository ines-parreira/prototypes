import {Campaign, GorgiasChatIntegration} from 'models/integration/types'

export interface CampaignTableContentCell {
    campaign: Campaign
    chatIntegration?: GorgiasChatIntegration
    currency: string
    metrics: Record<string, string | number>
}
