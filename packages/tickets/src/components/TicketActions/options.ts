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

export const MarkAsSpam = {
    id: 'mark-as-spam',
    label: 'Mark as spam',
    leadingSlot: IconName.StopSign,
    intent: Intent.Regular,
} as const

export const DeleteTicket = {
    id: 'delete-ticket',
    label: 'Delete',
    leadingSlot: IconName.TrashEmpty,
    intent: Intent.Destructive,
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
