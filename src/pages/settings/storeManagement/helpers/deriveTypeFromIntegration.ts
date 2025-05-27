import { Integration } from 'models/integration/types'

import {
    isContactFormChannel,
    isEmailChannel,
    isHelpCenterChannel,
    isTikTokChannel,
    isVoiceChannel,
} from './isIntegration'

export default function deriveTypeFromIntegration(integration: Integration) {
    if (isHelpCenterChannel(integration)) {
        return 'help-center'
    }
    if (isContactFormChannel(integration)) {
        return 'contact-form'
    }

    if (isTikTokChannel(integration)) {
        return 'tiktok-shop'
    }

    if (isEmailChannel(integration)) {
        return 'email'
    }
    if (isVoiceChannel(integration)) {
        return 'phone'
    }
    return integration.type
}
