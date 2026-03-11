import type { SystemViewDefinition } from '../types/views'

export const SYSTEM_VIEW_DEFINITIONS: Record<string, SystemViewDefinition> = {
    Inbox: {
        name: 'Inbox',
        label: 'Assigned to me',
        icon: 'user-arrow',
    },
    Unassigned: {
        name: 'Unassigned',
        label: 'Unassigned',
        icon: 'folder-remove',
    },
    All: {
        name: 'All',
        label: 'All',
        icon: 'inbox',
    },
    Snoozed: {
        name: 'Snoozed',
        label: 'Snoozed',
        icon: 'timer-snooze',
    },
    Closed: {
        name: 'Closed',
        label: 'Closed',
        icon: 'circle-check',
    },
    Trash: {
        name: 'Trash',
        label: 'Trash',
        icon: 'trash-empty',
    },
    Spam: {
        name: 'Spam',
        label: 'Spam',
        icon: 'octagon-error',
    },
}
