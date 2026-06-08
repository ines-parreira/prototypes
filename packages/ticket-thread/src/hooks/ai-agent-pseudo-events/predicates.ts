import { Duration } from '@gorgias/toolkit'

import type {
    TicketThreadAiAgentInternalNoteItem,
    TicketThreadAiAgentMessageItem,
    TicketThreadMessageItem,
} from '../messages/types'
import type { TicketThreadItem } from '../types'
import { TicketThreadItemTag } from '../types'

const LEGACY_AI_GROUPING_CHANNELS = new Set(['facebook-messenger', 'chat'])

export type TicketThreadAiAgentPseudoEventRenderableItem =
    | TicketThreadAiAgentMessageItem
    | TicketThreadAiAgentInternalNoteItem

export function isAiAgentPseudoEventMessageItem(
    item: TicketThreadItem | TicketThreadMessageItem,
): item is TicketThreadAiAgentPseudoEventRenderableItem {
    return (
        item._tag === TicketThreadItemTag.Messages.AiAgentMessage ||
        item._tag === TicketThreadItemTag.Messages.AiAgentInternalNote
    )
}

export function shouldGroupLegacyAiAgentMessages(
    firstInGroup: TicketThreadAiAgentPseudoEventRenderableItem,
    nextMessage: TicketThreadAiAgentPseudoEventRenderableItem,
): boolean {
    const firstCreated = new Date(firstInGroup.data.created_datetime).getTime()
    const nextCreated = new Date(nextMessage.data.created_datetime).getTime()

    return (
        [
            firstInGroup.data.sender.id,
            firstInGroup.data.channel,
            firstInGroup.data.public,
            firstInGroup.data.from_agent,
        ].join(':') ===
            [
                nextMessage.data.sender.id,
                nextMessage.data.channel,
                nextMessage.data.public,
                nextMessage.data.from_agent,
            ].join(':') &&
        LEGACY_AI_GROUPING_CHANNELS.has(String(firstInGroup.data.channel)) &&
        nextCreated < firstCreated + Duration.minutes(5)
    )
}
