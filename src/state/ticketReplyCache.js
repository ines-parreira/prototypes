/* cache ticket reply details in localStorage
 */

import {fromJS} from 'immutable'

const storage = window.localStorage
const TICKET_REPLY_CACHE_KEY = 'gorgias-ticket-reply'
const defaultTicket = fromJS({
    contentState: null,
    selectionState: null,
    macro: null
})

class TicketReplyCache {
    _items() {
        let cached = null
        // load from storage
        try {
            cached = JSON.parse(storage.getItem(TICKET_REPLY_CACHE_KEY))
        } catch (err) {
            console.error('Failed to read from local storage', err)
        }

        if (cached) {
            return fromJS(cached)
        }
        return fromJS({})
    }

    set(ticketId = 'new', ticketDetails) {
        // always use strings for ids
        const id = String(ticketId)

        // don't save cache for new tickets
        if (ticketId === 'new') {
            return
        }

        let items = this._items()
        const ticket = items.get(id)

        if (ticket) {
            // merge existing details
            items = items.set(id, ticket.merge(fromJS(ticketDetails)))
        } else {
            items = items.set(id, fromJS(ticketDetails))
        }

        // save in storage
        try {
            storage.setItem(TICKET_REPLY_CACHE_KEY, JSON.stringify(items.toJS()))
        } catch (err) {
            console.error('Failed to save new state in local storage', err)
        }
    }

    get(ticketId = 'new') {
        return this._items().get(String(ticketId)) || defaultTicket
    }

    delete(ticketId = 'new') {
        const items = this._items().delete(String(ticketId))

        // save in storage
        try {
            storage.setItem(TICKET_REPLY_CACHE_KEY, JSON.stringify(items.toJS()))
        } catch (err) {
            console.error('Failed to delete from local storage', err)
        }
    }
}

export default new TicketReplyCache()
