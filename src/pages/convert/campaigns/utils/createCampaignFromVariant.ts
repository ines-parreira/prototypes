import _omit from 'lodash/omit'
import { ulid } from 'ulidx'

import { removeLinksFromHtml } from 'utils/html'

import { Campaign, CampaignCreatePayload } from '../types/Campaign'
import { CampaignVariant } from '../types/CampaignVariant'
import { CampaignStatus } from '../types/enums/CampaignStatus.enum'
import { createTriggerRule } from './createTriggerRule'

export const createCampaignFromVariant = (
    campaign: Campaign,
    channelConnectionId: string | undefined,
    variant: CampaignVariant | undefined,
): CampaignCreatePayload => {
    if (!channelConnectionId) {
        throw new Error('Channel connection ID is required')
    }

    const triggers = campaign.triggers.map((trigger) => ({
        ...trigger,
        id: ulid(),
    }))

    let variation = {
        message_text: campaign.message_text,
        message_html: removeLinksFromHtml(campaign.message_html || ''),
        attachments: campaign.attachments ?? [],
    }

    if (!!variant) {
        variation = {
            message_text: variant.message_text,
            message_html: removeLinksFromHtml(variant.message_html || ''),
            attachments: variant.attachments ?? [],
        }
    }

    return {
        ..._omit(campaign, 'id', 'variants'),
        channel_connection_id: channelConnectionId,
        status: CampaignStatus.Inactive,
        triggers: triggers,
        trigger_rule: createTriggerRule(triggers),
        ...variation,
    }
}
