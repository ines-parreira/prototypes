import {CampaignAuthor} from './CampaignAgent'

export type CampaignDisplaysInSession = {
    value: number
}

export type MinimumTimeBetweenCampaigns = {
    value: number
    unit: 'hours' | 'minutes' | 'seconds'
}

export type CampaignMeta = {
    delay?: number | null
    noReply?: boolean | null
    maxCampaignDisplaysInSession?: CampaignDisplaysInSession | null
    minimumTimeBetweenCampaigns?: MinimumTimeBetweenCampaigns | null
} & CampaignAuthor
