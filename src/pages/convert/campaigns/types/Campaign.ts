import {
    Campaign as CampaignSchema,
    CampaignCreatePayload as CampaignCreatePayloadSchema,
} from 'models/convert/campaign/types'
import {CampaignAttachment} from './CampaignAttachment'
import {CampaignTrigger} from './CampaignTrigger'
import {CampaignMeta} from './CampaignMeta'
import {CampaignVariant} from './CampaignVariant'

type SharedCampaignParams = {
    attachments?: CampaignAttachment[]
    triggers: CampaignTrigger[]
    meta?: CampaignMeta
    variants?: CampaignVariant[] | null
}

export type Campaign = Omit<
    CampaignSchema,
    'attachments' | 'triggers' | 'meta' | 'variants'
> &
    SharedCampaignParams

export type CampaignCreatePayload = Omit<
    CampaignCreatePayloadSchema,
    'attachments' | 'triggers' | 'meta' | 'variants'
> &
    SharedCampaignParams
