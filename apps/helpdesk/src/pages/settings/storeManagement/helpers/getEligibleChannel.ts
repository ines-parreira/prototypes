import { Integration } from 'models/integration/types'

import {
    isChatChannel,
    isContactFormChannel,
    isEmailChannel,
    isFacebookChannel,
    isHelpCenterChannel,
    isSmsChannel,
    isTikTokChannel,
    isVoiceChannel,
    isWhatsAppChannel,
} from './isIntegration'

export default function getEligibleChannels(integrations: Integration[]) {
    return (integrations || []).filter((integration) => {
        return (
            isEmailChannel(integration) ||
            isChatChannel(integration) ||
            isVoiceChannel(integration) ||
            isSmsChannel(integration) ||
            isFacebookChannel(integration) ||
            isWhatsAppChannel(integration) ||
            isHelpCenterChannel(integration) ||
            isContactFormChannel(integration) ||
            isTikTokChannel(integration)
        )
    })
}
