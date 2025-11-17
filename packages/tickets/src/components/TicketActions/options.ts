import { IconName, Intent } from '@gorgias/axiom'

export const MergeTicket = {
    id: 'merge-ticket',
    name: 'Merge ticket',
    icon: IconName.ArrowMerging,
    intent: Intent.Regular,
} as const

export const MarkAsUnread = {
    id: 'mark-as-unread',
    name: 'Mark as unread',
    icon: IconName.CommMail,
    intent: Intent.Regular,
} as const

export const PrintTicket = {
    id: 'print-ticket',
    name: 'Print ticket',
    icon: IconName.SystemPrinter,
    intent: Intent.Regular,
} as const

export const MarkAsSpam = {
    id: 'mark-as-spam',
    name: 'Mark as spam',
    icon: IconName.StopSign,
    intent: Intent.Regular,
} as const

export const DeleteTicket = {
    id: 'delete-ticket',
    name: 'Delete',
    icon: IconName.TrashEmpty,
    intent: Intent.Destructive,
} as const

export const EventsOptions = {
    ShowAll: {
        id: 'show-all-events',
        name: 'Show all events',
        icon: IconName.ListUnordered,
        intent: Intent.Regular,
    },
    HideAll: {
        id: 'hide-all-events',
        name: 'Hide all events',
        icon: IconName.ListUnordered,
        intent: Intent.Regular,
    },
} as const

export const QuickRepliesOptions = {
    ShowAll: {
        id: 'show-all-quick-replies',
        name: 'Show all quick-replies',
        icon: IconName.Ai,
        intent: Intent.Regular,
    },
    HideAll: {
        id: 'hide-all-quick-replies',
        name: 'Hide all quick-replies',
        icon: IconName.Ai,
        intent: Intent.Regular,
    },
} as const
