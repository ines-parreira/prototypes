import * as ticketActions from '../state/ticket/actions'
import * as infobarActions from '../state/infobar/actions'
import * as usersActions from '../state/users/actions'
import * as viewsActions from '../state/views/actions'

import * as viewsConstants from '../state/views/constants'
import * as macroConstants from '../state/macro/constants'
import * as currentAccountConstants from '../state/currentAccount/constants'
import * as socketConstants from './socketConstants'

import {isCurrentlyOnTicket} from '../utils'
import {SID_UPDATED} from './socketConstants'

/**
 * Events that can be sent to server via socket
 * @enum name name of config (used to send the event)
 * @enum dataToSend function returning data that is sent to server when sending this event (bound to SocketManager instance)
 */
export const sendEvents = [
    {
        name: socketConstants.TICKET_VIEWED,
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                event: socketConstants.TICKET_VIEWED,
                dataType: 'Ticket',
                data: parseInt(id),
            }
        },
    },
    {
        name: socketConstants.AGENT_TYPING_STARTED,
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                event: socketConstants.AGENT_TYPING_STARTED,
                dataType: 'Ticket',
                data: parseInt(id),
            }
        },
    },
    {
        name: socketConstants.AGENT_TYPING_STOPPED,
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                event: socketConstants.AGENT_TYPING_STOPPED,
                dataType: 'Ticket',
                data: parseInt(id),
            }
        },
    },
    {
        name: socketConstants.VIEWS_COUNTS_EXPIRED,
        dataToSend: function (viewIds) {
            return {
                event: socketConstants.VIEWS_COUNTS_EXPIRED,
                dataType: 'View',
                data: viewIds,
            }
        },
    },
    {
        name: socketConstants.AGENT_ACTIVE,
        dataToSend: function() {
            return {
                event: socketConstants.AGENT_ACTIVE,
            }
        },
    },
    {
        name: socketConstants.SID_UPDATED,
        dataToSend: function() {
            return {
                clientId: window.CLIENT_ID,
                event: socketConstants.SID_UPDATED
            }
        }
    }
]

/**
 * Events describing a room to join on server via socket
 * @enum name name of config (used to send the event)
 * @enum dataToSend function returning data that is sent to server when sending this event (bound to SocketManager instance)
 * @enum [onLeave] callback executed after leaving room (bound to SocketManager instance)
 * @enum [onJoin] callback executed after joining room (bound to SocketManager instance)
 */
export const joinEvents = [{
    name: 'ticket',
    dataToSend: function (id) {
        return {
            clientId: window.CLIENT_ID,
            dataType: 'Ticket',
            data: parseInt(id),
        }
    },
    onLeave: function (id) {
        return this.send(socketConstants.AGENT_TYPING_STOPPED, id)
    }
}, {
    name: 'user',
    dataToSend: function (id) {
        return {
            clientId: window.CLIENT_ID,
            dataType: 'User',
            data: parseInt(id),
        }
    },
}, {
    name: 'view',
    dataToSend: function (id) {
        return {
            clientId: window.CLIENT_ID,
            dataType: 'View',
            data: parseInt(id),
        }
    },
}]


/**
 * Events that can be received from server via socket
 * @enum event name of event received
 * @enum onReceive function executed when this event is received (bound to SocketManager instance)
 */
export const receivedEvents = [{
    name: 'user-updated',
    onReceive: function (json) {
        return this.dispatch(ticketActions.mergeRequester(json.user))
    },
}, {
    name: 'user-location-updated',
    onReceive: function (json) {
        return this.dispatch(usersActions.setAgentsLocation(json.locations))
    },
}, {
    name: 'user-typing-status-updated',
    onReceive: function (json) {
        return this.dispatch(usersActions.setAgentsTypingStatus(json.locations))
    },
}, {
    name: 'ticket-updated',
    onReceive: function (json) {
        if (isCurrentlyOnTicket(json.ticket.id)) {
            this.send(socketConstants.TICKET_VIEWED, json.ticket.id)
        }

        return this.dispatch(ticketActions.mergeTicket(json.ticket))
    },
}, {
    name: 'ticket-message-created',
    onReceive: function (json) {
        if (isCurrentlyOnTicket(json.ticket.id)) {
            this.send(socketConstants.TICKET_VIEWED, json.ticket.id)
        }

        return this.dispatch(ticketActions.mergeTicket(json.ticket))
    },
}, {
    name: 'ticket-message-action-failed',
    onReceive: function (json) {
        return this.dispatch(ticketActions.handleMessageActionError(json.ticket_id))
    },
}, {
    name: 'action-executed',
    onReceive: function (json) {
        return this.dispatch(infobarActions.handleExecutedAction(json))
    },
}, {
    name: 'view-created',
    onReceive: function (json) {
        return this.dispatch({
            type: viewsConstants.CREATE_VIEW_SUCCESS,
            resp: json.view,
        })
    },
}, {
    name: 'view-updated',
    onReceive: function (json) {
        return this.dispatch({
            type: viewsConstants.UPDATE_VIEW_SUCCESS,
            resp: json.view,
        })
    },
}, {
    name: 'view-deleted',
    onReceive: function (json) {
        return this.dispatch(viewsActions.deleteViewSuccess(json.view.id))
    },
}, {
    name: 'views-count-updated',
    onReceive: function (json) {
        return this.dispatch(viewsActions.handleViewsCount(json.counts))
    },
}, {
    name: 'macro-created',
    onReceive: function (json) {
        return this.dispatch({
            type: macroConstants.CREATE_MACRO_SUCCESS,
            resp: json.macro,
        })
    },
}, {
    name: 'macro-updated',
    onReceive: function (json) {
        return this.dispatch({
            type: macroConstants.UPDATE_MACRO_SUCCESS,
            resp: json.macro,
        })
    },
}, {
    name: 'macro-deleted',
    onReceive: function (json) {
        return this.dispatch({
            type: macroConstants.DELETE_MACRO_SUCCESS,
            resp: json.macro,
        })
    },
}, {
    name: 'account-updated',
    onReceive: function (json) {
        return this.dispatch({
            type: currentAccountConstants.UPDATE_ACCOUNT_SUCCESS,
            resp: json.account,
        })
    },
}, {
    name: SID_UPDATED,
    onReceive: function () {
        return this.send(socketConstants.SID_UPDATED)
    }
}
]
