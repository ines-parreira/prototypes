import {
    Campaign as CampaignSchema,
    CampaignCreatePayload as CampaignCreatePayloadSchema,
} from 'models/convert/campaign/types'
import {CampaignAttachment} from './CampaignAttachment'
import {CampaignTrigger} from './CampaignTrigger'
import {CampaignMeta} from './CampaignMeta'

type SharedCampaignParams = {
    attachments?: CampaignAttachment[]
    triggers: CampaignTrigger[]
    meta?: CampaignMeta
}

export type Campaign = Omit<
    CampaignSchema,
    'attachments' | 'triggers' | 'meta'
> &
    SharedCampaignParams

export type CampaignCreatePayload = Omit<
    CampaignCreatePayloadSchema,
    'attachments' | 'triggers' | 'meta'
> &
    SharedCampaignParams
