import { List } from 'immutable'

import { TicketMessageSourceType } from 'business/types/ticket'
import { toImmutable } from 'common/utils'

import sourceTypeToChannel from './sourceTypeToChannel'

/**
 * Map a source type to a channel.
 * Returns undefined for internal note as we dont have enough information to guess the channel.
 */
export default function getChannelFromSourceType(
    sourceType: TicketMessageSourceType,
    messages: List<any> | any[],
) {
    return sourceTypeToChannel(sourceType, toImmutable(messages))
}
