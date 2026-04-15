import type {
    TicketHighlightMeta,
    TicketsSearchListMeta,
} from '@gorgias/helpdesk-types'

export function getSearchTotalResources(
    meta: TicketHighlightMeta | TicketsSearchListMeta | undefined | null,
) {
    if (!meta) {
        return undefined
    }

    if (typeof meta !== 'object') {
        return undefined
    }

    if (!('total_resources' in meta)) {
        return undefined
    }

    if (typeof meta.total_resources !== 'number') {
        return undefined
    }

    return meta.total_resources
}
