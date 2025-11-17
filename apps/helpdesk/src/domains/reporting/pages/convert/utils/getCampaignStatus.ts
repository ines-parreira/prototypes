import moment from 'moment-timezone'

import type { Campaign } from 'models/convert/campaign/types'
import { InferredCampaignStatus } from 'models/convert/campaign/types'

export const getCampaignStatus = (
    campaign: Campaign,
    timezone: string,
): InferredCampaignStatus => {
    const currentDate = moment()

    if (campaign.schedule && campaign.status === 'active') {
        if (
            campaign.schedule.end_datetime &&
            currentDate.isAfter(
                moment.utc(campaign.schedule.end_datetime).tz(timezone),
            )
        ) {
            return InferredCampaignStatus.Inactive
        } else if (
            moment
                .utc(campaign.schedule.start_datetime)
                .tz(timezone)
                .isBefore(currentDate)
        ) {
            return InferredCampaignStatus.Active
        }

        return InferredCampaignStatus.Scheduled
    }

    if (!!campaign.deleted_datetime) {
        return InferredCampaignStatus.Deleted
    }

    if (campaign.status === 'active') {
        return InferredCampaignStatus.Active
    }

    return InferredCampaignStatus.Inactive
}
