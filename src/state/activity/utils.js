import {isCurrentlyOnTicket, isCurrentlyOnView} from '../../utils'

const ignoredIds = ['search', 'new', '0', 0]

/**
 * Return true if ticket should be updated (refeteched)
 * @param ticketId
 * @returns {boolean}
 */
export const shouldUpdateTicket = (ticketId) => {
    return !ignoredIds.includes(ticketId) && isCurrentlyOnTicket(ticketId)
}

/**
 * Return true if view should be updated (refetched)
 * @param viewId
 * @param viewsState
 * @returns {boolean}
 */
export const shouldUpdateView = (viewId, viewsState) => {
    return !ignoredIds.includes(viewId) && isCurrentlyOnView(viewId, viewsState)
}
