import type { ValueOf } from '@repo/types'

type CanduLinkableDecoration = {
    emoji?: string
}

type CanduLinkableElement = {
    decoration?: CanduLinkableDecoration | null
    name: string
}

export const systemViewIcons = {
    all: 'all_inbox',
    closed: 'check',
    inbox: 'inbox',
    snoozed: 'snooze',
    spam: 'error_outline',
    trash: 'delete',
    unassigned: 'assignment_ind',
} as const

const canduLinkEmojiByName: Record<string, string> = {
    'AI Agent': '✨',
    Handover: '🧑‍💻',
    Close: '✅',
    All: '📂',
}

export const EmptyViewsState = {
    Empty: 'empty',
    InvalidFilters: 'invalidFilters',
    Inaccessible: 'inaccessible',
    Error: 'error',
} as const

export type ViewEmptyStateKind = ValueOf<typeof EmptyViewsState>

export function isInboxView(
    view?: {
        slug?: string | null
        category?: string | null
        name?: string | null
    } | null,
): boolean {
    return (
        view?.slug === 'inbox' ||
        (view?.category === 'system' && view?.name === 'Inbox')
    )
}

export function getViewAwareEmptyStateMessage({
    kind,
    isInboxView,
}: {
    kind: ViewEmptyStateKind
    isInboxView?: boolean
}) {
    switch (kind) {
        case EmptyViewsState.Empty:
            return isInboxView !== false
                ? {
                      heading: 'No open tickets',
                      subText: "You've closed all your tickets!",
                  }
                : {
                      heading: 'No tickets',
                      subText: 'There are no tickets matching these filters',
                  }
        case EmptyViewsState.InvalidFilters:
            return {
                heading: 'Invalid filters',
                subText:
                    'This view is deactivated as at least one filter is invalid.',
            }
        case EmptyViewsState.Inaccessible:
            return {
                heading: "Can't access view",
                subText:
                    'This view does not exist or you do not have the correct permissions',
            }
        case EmptyViewsState.Error:
            return {
                heading: 'Network error',
                subText: 'Unable to load this view currently',
            }
    }
}

export function addCanduLinkForValidViewOrSection(
    elementType: 'section',
    element: CanduLinkableElement,
): string | null
export function addCanduLinkForValidViewOrSection(
    elementType: 'view',
    element: CanduLinkableElement,
): string | null
export function addCanduLinkForValidViewOrSection(
    elementType: 'view' | 'section',
    element: CanduLinkableElement,
): string | null {
    const expectedEmoji = canduLinkEmojiByName[element.name]

    if (expectedEmoji && element.decoration?.emoji === expectedEmoji) {
        const slug = element.name.replace(/\s+/g, '-').toLowerCase()

        return `ticket-navbar-ai-agent-${elementType}-link-${slug}`
    }

    return null
}
