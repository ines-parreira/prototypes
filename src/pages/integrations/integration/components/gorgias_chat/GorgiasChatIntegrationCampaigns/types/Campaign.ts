import {CampaignAuthor} from './CampaignAgent'
import {CampaignTrigger} from './CampaignTrigger'

export interface ChatCampaign {
    id: string
    message: {
        author?: CampaignAuthor
        html: string
        text: string
    }
    name: string
    triggers: CampaignTrigger[]
}
