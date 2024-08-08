import _omit from 'lodash/omit'
import {ulid} from 'ulidx'
import {removeLinksFromHtml} from 'utils/html'
import {Campaign, CampaignCreatePayload} from '../types/Campaign'
import {CampaignStatus} from '../types/enums/CampaignStatus.enum'
import {createTriggerRule} from './createTriggerRule'

export const duplicateCampaign = (
    campaign: Campaign,
    channelConnectionId: string | undefined
): CampaignCreatePayload => {
    if (!channelConnectionId) {
        throw new Error('Channel connection ID is required')
    }

    const triggers = campaign.triggers.map((trigger) => ({
        ...trigger,
        id: ulid(),
    }))

    return {
        ..._omit(campaign, 'id'),
        channel_connection_id: channelConnectionId,
        name: `(Copy) ${campaign.name}`,
        status: CampaignStatus.Inactive,
        message_text: campaign.message_text ?? '',
        message_html: removeLinksFromHtml(campaign.message_html || '') ?? '',
        triggers: triggers,
        trigger_rule: createTriggerRule(triggers),
        variants: [],
    }
}
