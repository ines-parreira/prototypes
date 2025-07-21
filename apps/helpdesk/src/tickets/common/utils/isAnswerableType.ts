import { isTicketMessageSourceType } from 'models/ticket/predicates'
import { ChannelLike, toChannel } from 'services/channels'
import { USABLE_SOURCE_TYPES } from 'tickets/common/config'

/**
 * Return true if passed source type can be used to answer (can be used as a source type in a new message)
 */
export default function isAnswerableType(channelLike: ChannelLike): boolean {
    if (isTicketMessageSourceType(channelLike)) {
        return USABLE_SOURCE_TYPES.includes(channelLike)
    }

    const channel = toChannel(channelLike)
    if (channel) {
        return true
    }

    return false
}
