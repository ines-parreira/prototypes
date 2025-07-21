import { Integration } from 'models/integration/types'

import {
    isContactFormChannel,
    isHelpCenterChannel,
} from '../../../helpers/isIntegration'
import { ChannelWithMetadata } from '../../../types'
import isChannelAlreadyMapped from '../helpers/isChannelAlreadyMapped'

export const shouldShowDeleteButton = (
    activeChannel: ChannelWithMetadata,
    channel: Integration,
): boolean => {
    if (activeChannel.type !== 'contactForm') {
        return true
    }
    return !isChannelAlreadyMapped(activeChannel, channel.id)
}

export const shouldShowEditButton = (channel: Integration): boolean => {
    return !isHelpCenterChannel(channel) && !isContactFormChannel(channel)
}
