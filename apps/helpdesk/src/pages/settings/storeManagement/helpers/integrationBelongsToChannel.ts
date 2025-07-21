import { Integration } from 'models/integration/types'

import { ChannelTypes } from '../types'
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

export default function integrationBelongsToChannel(
    integration: Integration,
    chanelType: ChannelTypes,
) {
    switch (chanelType) {
        case 'email':
            return isEmailChannel(integration)
        case 'chat':
            return isChatChannel(integration)
        case 'helpCenter':
            return isHelpCenterChannel(integration)
        case 'contactForm':
            return isContactFormChannel(integration)
        case 'voice':
            return isVoiceChannel(integration)
        case 'sms':
            return isSmsChannel(integration)
        case 'whatsApp':
            return isWhatsAppChannel(integration)
        case 'facebook':
            return isFacebookChannel(integration)
        case 'tiktokShop':
            return isTikTokChannel(integration)
        default:
            return false
    }
}
