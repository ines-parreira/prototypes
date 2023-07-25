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
    attachments?: CampaignAttachment[]
    triggers: CampaignTrigger[]
    deactivated_datetime?: string
}
