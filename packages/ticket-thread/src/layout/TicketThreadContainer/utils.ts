import type { TicketThreadItem } from '../../hooks/types'

type TicketThreadBaseItem = {
    _tag: string
    data: unknown
    datetime?: string
}

type TicketThreadComposerItem = {
    _tag: 'composer'
    data: null
}

export type TicketThreadVirtualizedListItem =
    | TicketThreadItem
    | TicketThreadComposerItem

export const composerItem: TicketThreadComposerItem = {
    _tag: 'composer',
    data: null,
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function getDataIdentifier(value: unknown): string | null {
    if (Array.isArray(value)) {
        const first = value.at(0)
        const last = value.at(-1)

        if (!first || !last) {
            return null
        }

        return `${getThreadItemIdentifier(first)}:${getThreadItemIdentifier(last)}`
    }

    if (!isRecord(value)) {
        return null
    }

    if ('id' in value && value.id != null) {
        return String(value.id)
    }

    if (
        'rule_suggestion' in value &&
        isRecord(value.rule_suggestion) &&
        'id' in value.rule_suggestion &&
        value.rule_suggestion.id != null
    ) {
        return String(value.rule_suggestion.id)
    }

    return null
}

function getThreadItemIdentifier(item: TicketThreadBaseItem): string {
    const dataIdentifier = getDataIdentifier(item.data)

    if (dataIdentifier) {
        return `${item._tag}:${dataIdentifier}`
    }

    if ('datetime' in item && item.datetime) {
        return `${item._tag}:${item.datetime}`
    }

    return item._tag
}

function getThreadItemKey(
    item: TicketThreadBaseItem,
    index: number,
    ticketId?: string,
): string {
    return `${getThreadItemIdentifier(item)}:${ticketId ?? 'ticket'}:${index}`
}

export function getThreadListItemKey(
    item: TicketThreadVirtualizedListItem,
    index: number,
    ticketId: string | undefined,
    ticketThreadItemsCount: number,
): string {
    if (item._tag === 'composer') {
        return `composer:${ticketThreadItemsCount}:${ticketId ?? 'ticket'}`
    }

    return getThreadItemKey(item, index, ticketId)
}

export function isComposerItem(
    item: TicketThreadVirtualizedListItem,
): item is TicketThreadComposerItem {
    return item._tag === 'composer'
}
