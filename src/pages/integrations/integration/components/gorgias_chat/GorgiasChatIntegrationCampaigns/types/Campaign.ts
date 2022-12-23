import {CampaignAuthor} from './CampaignAgent'
import {CampaignTrigger} from './CampaignTrigger'

export interface ChatCampaign {
    id: string
    meta?: {
        delay: number
    }
    message: {
        author?: CampaignAuthor
        html: string
        text: string
    }
    name: string
    attachments?: Array<{
        url?: string
        name: string
        contentType: string
        size: number
        extra: object & {
            price: number
            currency?: string
            product_link: string
            product_id: number
            variant_name?: string
        }
    }>
    triggers: CampaignTrigger[]
}
