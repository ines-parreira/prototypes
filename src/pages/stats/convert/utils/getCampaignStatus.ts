import {Campaign, InferredCampaignStatus} from 'models/convert/campaign/types'

export const getCampaignStatus = (
    campaign: Campaign
): InferredCampaignStatus => {
    if (!!campaign.deleted_datetime) {
        return InferredCampaignStatus.Deleted
    }

    if (campaign.status === 'active') {
        return InferredCampaignStatus.Active
    }

    return InferredCampaignStatus.Inactive
}
