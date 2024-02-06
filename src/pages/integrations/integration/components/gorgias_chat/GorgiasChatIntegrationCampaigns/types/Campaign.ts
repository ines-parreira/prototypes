import {CampaignAuthor} from './CampaignAgent'
import {CampaignAttachment} from './CampaignAttachment'
import {CampaignTrigger} from './CampaignTrigger'

export interface ChatCampaign {
    id: string
    meta?: {
        delay: number
        noReply?: boolean
    }
    message: {
        author?: CampaignAuthor
        html: string
        text: string
    }
    name: string
    language?: string
    attachments?: CampaignAttachment[]
    triggers: CampaignTrigger[]
    deactivated_datetime?: string
    created_datetime?: string | null
    tracking_tag_id?: number
}
