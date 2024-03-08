import {CampaignAuthor} from './CampaignAgent'

export type CampaignMeta = {
    delay?: number | null
    noReply?: boolean | null
} & CampaignAuthor
