import { Intent } from '@gorgias/axiom'

export const MergeTicket = {
    id: 'merge-ticket',
    label: 'Merge ticket',
    leadingSlot: 'arrow-merging',
    intent: Intent.Regular,
} as const

export const MarkAsUnread = {
    id: 'mark-as-unread',
    label: 'Mark as unread',
    leadingSlot: 'mail',
    intent: Intent.Regular,
} as const

export const PrintTicket = {
    id: 'print-ticket',
    label: 'Print ticket',
    leadingSlot: 'system-printer',
    intent: Intent.Regular,
} as const

export const SpamOptions = {
    id: 'spam-options',
    MarkAsSpam: {
        label: 'Mark as spam',
        leadingSlot: 'stop-sign',
        intent: Intent.Regular,
    },
    UnmarkAsSpam: {
        label: 'Unmark as spam',
        leadingSlot: 'arrow-undo-up-left',
        intent: Intent.Regular,
    },
} as const

export const TrashTicketOptions = {
    id: 'trash-ticket-options',
    Delete: {
        label: 'Move to trash',
        leadingSlot: 'trash-empty',
        intent: Intent.Destructive,
    },
    Undelete: {
        label: 'Restore ticket',
        leadingSlot: 'arrow-undo-up-left',
        intent: Intent.Regular,
    },
} as const

export const EventsOptions = {
    id: 'events-options',
    ShowAll: {
        label: 'Show all events',
        leadingSlot: 'list-unordered',
        intent: Intent.Regular,
    },
    HideAll: {
        label: 'Hide all events',
        leadingSlot: 'list-unordered',
        intent: Intent.Regular,
    },
} as const

export const QuickRepliesOptions = {
    id: 'quick-replies-options',
    ShowAll: {
        label: 'Show all quick replies',
        leadingSlot: 'ai',
        intent: Intent.Regular,
    },
    HideAll: {
        label: 'Hide all quick replies',
        leadingSlot: 'ai',
        intent: Intent.Regular,
    },
} as const
