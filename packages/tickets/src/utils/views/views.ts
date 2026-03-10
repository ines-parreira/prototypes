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
