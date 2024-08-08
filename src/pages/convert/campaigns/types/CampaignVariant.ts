import {CampaignAttachment} from './CampaignAttachment'

export type CampaignVariant = {
    id: string | null
    message_text: string
    message_html?: string | null
    attachments?: CampaignAttachment[] | null
    started_datetime?: string | null
    stopped_datetime?: string | null
}
