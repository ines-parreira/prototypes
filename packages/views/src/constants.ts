import { DurationInMs } from '@repo/utils'

export const VIEWS_STALE_TIME = DurationInMs.OneDay * 2

export const INBOX_SYSTEM_VIEW_NAME = 'Inbox'

export const TOP_SYSTEM_VIEW_NAMES: readonly string[] = [
    INBOX_SYSTEM_VIEW_NAME,
    'Unassigned',
    'All',
    'Snoozed',
]

export const BOTTOM_SYSTEM_VIEW_NAMES: readonly string[] = [
    'Closed',
    'Trash',
    'Spam',
]

export const DEFAULT_TOP_SYSTEM_VIEW_ORDER: Record<string, number> = {
    Inbox: 0,
    Unassigned: 1,
    All: 2,
    Snoozed: 3,
}

export const DEFAULT_BOTTOM_SYSTEM_VIEW_ORDER: Record<string, number> = {
    Closed: 0,
    Trash: 1,
    Spam: 2,
}
