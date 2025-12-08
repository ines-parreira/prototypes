import { IconName, Intent } from '@gorgias/axiom'

export const MergeTicket = {
    id: 'merge-ticket',
    label: 'Merge ticket',
    leadingSlot: IconName.ArrowMerging,
    intent: Intent.Regular,
} as const

export const MarkAsUnread = {
    id: 'mark-as-unread',
    label: 'Mark as unread',
    leadingSlot: IconName.CommMail,
    intent: Intent.Regular,
} as const

export const PrintTicket = {
    id: 'print-ticket',
    label: 'Print ticket',
    leadingSlot: IconName.SystemPrinter,
    intent: Intent.Regular,
} as const

export const SpamOptions = {
    id: 'spam-options',
    MarkAsSpam: {
        label: 'Mark as spam',
        leadingSlot: IconName.StopSign,
        intent: Intent.Regular,
    },
    UnmarkAsSpam: {
        label: 'Unmark as spam',
        leadingSlot: IconName.ArrowUndoUpLeft,
        intent: Intent.Regular,
    },
} as const

export const TrashTicketOptions = {
    id: 'trash-ticket-options',
    Delete: {
        label: 'Move to trash',
        leadingSlot: IconName.TrashEmpty,
        intent: Intent.Destructive,
    },
    Undelete: {
        label: 'Restore ticket',
        leadingSlot: IconName.ArrowUndoUpLeft,
        intent: Intent.Regular,
    },
} as const

export const EventsOptions = {
    id: 'events-options',
    ShowAll: {
        label: 'Show all events',
        leadingSlot: IconName.ListUnordered,
        intent: Intent.Regular,
    },
    HideAll: {
        label: 'Hide all events',
        leadingSlot: IconName.ListUnordered,
        intent: Intent.Regular,
    },
} as const

export const QuickRepliesOptions = {
    id: 'quick-replies-options',
    ShowAll: {
        label: 'Show all quick replies',
        leadingSlot: IconName.Ai,
        intent: Intent.Regular,
    },
    HideAll: {
        label: 'Hide all quick replies',
        leadingSlot: IconName.Ai,
        intent: Intent.Regular,
    },
} as const
