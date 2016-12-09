import {isCurrentlyOnTicket, isCurrentlyOnView} from '../../utils'

/**
 * Return true if ticket should be updated (refeteched)
 * @param ticketId
 * @returns {boolean}
 */
export const shouldUpdateTicket = (ticketId) => {
    return isCurrentlyOnTicket(ticketId)
}

/**
 * Return true if view should be updated (refetched)
 * @param viewId
 * @param viewsState
 * @returns {boolean}
 */
export const shouldUpdateView = (viewId, viewsState) => {
    return isCurrentlyOnView(viewId, viewsState)
}
