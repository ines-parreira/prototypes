import { Section } from 'models/section/types'
import { View } from 'models/view/types'

// Icons for known system views (not used in logic yet)
export const systemViewIcons = {
    all: 'all_inbox',
    closed: 'check',
    inbox: 'inbox',
    snoozed: 'snooze',
    spam: 'error_outline',
    trash: 'delete',
    unassigned: 'assignment_ind',
}

// Overloads
export function addCanduLinkForValidViewOrSection(
    elementType: 'section',
    element: Section,
): string | null
export function addCanduLinkForValidViewOrSection(
    elementType: 'view',
    element: View,
): string | null

// Implementation
export function addCanduLinkForValidViewOrSection(
    elementType: 'view' | 'section',
    element: View | Section,
): string | null {
    // --------- AI Agent ----------
    if (
        (element.name === 'AI Agent' && element.decoration?.emoji === '✨') ||
        (element.name === 'Handover' && element.decoration?.emoji === '🧑‍💻') ||
        (element.name === 'Close' && element.decoration?.emoji === '✅') ||
        (element.name === 'All' && element.decoration?.emoji === '📂')
    ) {
        const slug = `${element.name.replace(/\s+/g, '-').toLowerCase()}`
        return `ticket-navbar-ai-agent-${elementType}-link-${slug}`
    }

    return null
}
