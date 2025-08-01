import { JobType } from '@gorgias/helpdesk-queries'

import { Item } from 'components/Dropdown'
import { Update } from 'jobs'

export type Job = {
    label: string
    type?: JobType
    params?: (item?: Item | null) => { updates: XOR<Update> }
    className?: string
    subItem?: string
    event?: string
}

export enum Action {
    Tag = 'tag',
    Team = 'team',
    MarkAsUnread = 'mark_as_unread',
    MarkAsRead = 'mark_as_read',
    Macro = 'macro',
    ExportTickets = 'export_tickets',
    Untrash = 'untrash',
    Delete = 'delete',
    Trash = 'trash',
    Priority = 'priority',
}
