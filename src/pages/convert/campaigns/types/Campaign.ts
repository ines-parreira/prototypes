import {
    CampaignCreatePayload as CampaignCreatePayloadSchema,
    CampaignPublishType,
    Campaign as CampaignSchema,
} from 'models/convert/campaign/types'

import { CampaignAttachment } from './CampaignAttachment'
import { CampaignMeta } from './CampaignMeta'
import { ScheduleSchema } from './CampaignSchedule'
import { CampaignTrigger } from './CampaignTrigger'
import { CampaignVariant } from './CampaignVariant'

type SharedCampaignParams = {
    attachments?: CampaignAttachment[]
    triggers: CampaignTrigger[]
    meta?: CampaignMeta
    variants?: CampaignVariant[] | null
    publish_mode?: CampaignPublishType | null
    schedule?: ScheduleSchema | null
}

export type Campaign = Omit<
    CampaignSchema,
    'attachments' | 'triggers' | 'meta' | 'variants' | 'schedule'
> &
    SharedCampaignParams

export type CampaignCreatePayload = Omit<
    CampaignCreatePayloadSchema,
    'attachments' | 'triggers' | 'meta' | 'variants' | 'schedule'
> &
    SharedCampaignParams
