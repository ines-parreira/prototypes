import { Integration } from 'models/integration/types'

import {
    isChatChannel,
    isEmailChannel,
    isTikTokChannel,
} from '../../../helpers/isIntegration'

export default function determineChannelLink(channel: Integration): string {
    if (isEmailChannel(channel)) {
        return `/app/settings/channels/email/${channel.id}`
    }
    if (isChatChannel(channel)) {
        return `/app/settings/channels/gorgias_chat/${channel.id}`
    }
    if (isTikTokChannel(channel)) {
        return '/app/settings/integrations/app/653a626236234a4ec85eca67/connections'
    }

    switch (channel.type) {
        case 'sms':
            return `/app/settings/channels/sms/${channel.id}/preferences`
        case 'facebook':
            return `/app/settings/integrations/facebook/${channel.id}/overview`
        case 'phone':
            return `/app/settings/channels/phone/${channel.id}/preferences`
        case 'aircall':
            return `/app/settings/integrations/aircall`
        case 'whatsapp':
            return `/app/settings/integrations/whatsapp/${channel.id}/preferences`
        default:
            return `/settings/integrations/app/${channel.id}`
    }
}
