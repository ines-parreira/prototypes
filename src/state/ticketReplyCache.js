/* cache ticket reply details in localStorage
 */

import {fromJS} from 'immutable'

const ticketReplyCache = 'gorgias-ticket-reply'
const storage = window.localStorage

class TicketReplyCache {
    constructor() {
        this.tickets = fromJS({})

        // load from storage
        try {
            const cached = JSON.parse(storage.getItem(ticketReplyCache))

            if (cached) {
                this.tickets = fromJS(cached)
            }
        } catch (err) {
            //
        }
    }

    set(ticketId = 'new', ticketDetails) {
        // always use strings for ids
        const id = String(ticketId)
        const ticket = this.tickets.get(id)

        if (ticket) {
            // merge existing details
            this.tickets = this.tickets.set(id, ticket.merge(fromJS(ticketDetails)))
        } else {
            this.tickets = this.tickets.set(id, fromJS(ticketDetails))
        }

        // save in storage
        try {
            storage.setItem(ticketReplyCache, JSON.stringify(this.tickets.toJS()))
        } catch (err) {
            //
        }
    }

    get(ticketId = 'new') {
        const id = String(ticketId)
        const defaultTicket = fromJS({
            contentState: null,
            selectionState: null,
            macro: null
        })

        // return immutable
        return this.tickets.get(id) || defaultTicket
    }

    delete(ticketId = 'new') {
        // always use strings for ids
        this.tickets = this.tickets.delete(ticketId.toString())

        // save in storage
        try {
            storage.setItem(ticketReplyCache, JSON.stringify(this.tickets.toJS()))
        } catch (err) {
            // nothing do to
        }
    }
}

export default new TicketReplyCache()
