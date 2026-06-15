import { TicketStatus } from '@gorgias/helpdesk-queries'
import type { TicketMessage } from '@gorgias/helpdesk-queries'

import type { TicketThreadItem } from '../../thread/types'
import type { TicketThreadMessageItem } from '../../ticket-messages/types'
import type { TicketThreadAiAgentPseudoEventRenderableItem } from '../predicates/pseudoEvents'
import {
    isAiAgentPseudoEventMessageItem,
    shouldGroupLegacyAiAgentMessages,
} from '../predicates/pseudoEvents'
import type {
    TicketThreadAiAgentPseudoEvent,
    TicketThreadAiAgentPseudoEventTag,
} from '../types'
import { TicketThreadAiAgentPseudoEventAction } from '../types'

const ACTION_NAME_ADD_TAGS = 'addTags'
const ACTION_NAME_SET_STATUS = 'setStatus'
const ACTION_NAME_SNOOZE_TICKET = 'snoozeTicket'
const AI_HANDOVER_TAG = 'ai_handover'
const AI_TAG_PREFIX = 'ai_'

function isRecord(input: unknown): input is Record<string, unknown> {
    return typeof input === 'object' && input !== null
}

function getActionName(action: unknown): string | null {
    if (!isRecord(action) || typeof action.name !== 'string') {
        return null
    }

    return action.name
}

function getActionArguments(action: unknown): Record<string, unknown> | null {
    if (!isRecord(action) || !isRecord(action.arguments)) {
        return null
    }

    return action.arguments
}

export function findAndSplitMessageTags(
    actions: TicketMessage['actions'],
): string[] {
    const tags = actions?.find(
        (action) => getActionName(action) === ACTION_NAME_ADD_TAGS,
    )?.arguments

    const tagNames = isRecord(tags) ? tags.tags : null

    return typeof tagNames === 'string'
        ? tagNames
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
        : []
}

export function getAiAgentPseudoEventFromMessage(
    allTags: TicketThreadAiAgentPseudoEventTag[],
    message: TicketMessage,
): TicketThreadAiAgentPseudoEvent {
    const messageTagNames = findAndSplitMessageTags(message.actions)

    const tags = messageTagNames
        .filter((tagName) => !tagName.startsWith(AI_TAG_PREFIX))
        .map(
            (tagName) =>
                allTags.find((tag) => tag.name === tagName) ?? {
                    name: tagName,
                    decoration: null,
                },
        )

    const isHandover = messageTagNames.some((tag) => tag === AI_HANDOVER_TAG)
    const isSnoozed = message.actions?.some(
        (action) => getActionName(action) === ACTION_NAME_SNOOZE_TICKET,
    )
    const isClosed = message.actions?.some(
        (action) =>
            getActionName(action) === ACTION_NAME_SET_STATUS &&
            getActionArguments(action)?.status === TicketStatus.Closed,
    )

    const action = isClosed
        ? TicketThreadAiAgentPseudoEventAction.Close
        : isSnoozed
          ? TicketThreadAiAgentPseudoEventAction.Snooze
          : isHandover
            ? TicketThreadAiAgentPseudoEventAction.Handover
            : null

    return { tags, action }
}

function withAiAgentPseudoEventDecoration<
    TItem extends TicketThreadAiAgentPseudoEventRenderableItem,
>(item: TItem, aiAgentPseudoEvent: TicketThreadAiAgentPseudoEvent): TItem {
    return {
        ...item,
        data: {
            ...item.data,
            decorations: {
                ...item.data.decorations,
                aiAgentPseudoEvent,
            },
        },
    }
}

type DecorateMessagesWithAiAgentPseudoEventsParams = {
    messages: TicketThreadMessageItem[]
    persistedItems: TicketThreadItem[]
    pseudoEventsBySourceMessageId: ReadonlyMap<
        number,
        TicketThreadAiAgentPseudoEvent
    >
    showTicketEvents: boolean
}

export function decorateMessagesWithAiAgentPseudoEvents({
    messages,
    persistedItems,
    pseudoEventsBySourceMessageId,
    showTicketEvents,
}: DecorateMessagesWithAiAgentPseudoEventsParams): TicketThreadMessageItem[] {
    if (showTicketEvents) {
        return messages
    }

    const attachedPseudoEventsByAnchorMessageId = new Map<
        number,
        TicketThreadAiAgentPseudoEvent
    >()
    let currentBlock: TicketThreadAiAgentPseudoEventRenderableItem[] = []

    const flushCurrentBlock = () => {
        if (!currentBlock.length) {
            return
        }

        const anchor = currentBlock[currentBlock.length - 1]
        const source = [...currentBlock]
            .reverse()
            .find((item) => item.data.via === 'api')

        currentBlock = []

        if (
            !source ||
            typeof source.data.id !== 'number' ||
            typeof anchor.data.id !== 'number'
        ) {
            return
        }

        const aiAgentPseudoEvent = pseudoEventsBySourceMessageId.get(
            source.data.id,
        )

        if (
            !aiAgentPseudoEvent ||
            (!aiAgentPseudoEvent.action && !aiAgentPseudoEvent.tags.length)
        ) {
            return
        }

        attachedPseudoEventsByAnchorMessageId.set(
            anchor.data.id,
            aiAgentPseudoEvent,
        )
    }

    for (const item of persistedItems) {
        if (!isAiAgentPseudoEventMessageItem(item)) {
            flushCurrentBlock()
            continue
        }

        const firstInGroup = currentBlock[0]

        if (
            firstInGroup &&
            shouldGroupLegacyAiAgentMessages(firstInGroup, item)
        ) {
            currentBlock.push(item)
            continue
        }

        flushCurrentBlock()
        currentBlock = [item]
    }

    flushCurrentBlock()

    return messages.map((item) => {
        if (
            !isAiAgentPseudoEventMessageItem(item) ||
            typeof item.data.id !== 'number'
        ) {
            return item
        }

        const aiAgentPseudoEvent = attachedPseudoEventsByAnchorMessageId.get(
            item.data.id,
        )

        /* v8 ignore next -- defensive lookup guard, map presence is already checked */
        if (!aiAgentPseudoEvent) {
            return item
        }

        return withAiAgentPseudoEventDecoration(item, aiAgentPseudoEvent)
    })
}
