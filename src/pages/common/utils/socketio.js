import socketio from 'socket.io-client'
import {isCurrentlyOnTicket} from '../../../utils'
import _throttle from 'lodash/throttle'
import _reject from 'lodash/reject'
import _get from 'lodash/get'

import * as ticketActions from '../../../state/ticket/actions'
import * as infobarActions from '../../../state/infobar/actions'
import * as usersActions from '../../../state/users/actions'
import * as viewsActions from '../../../state/views/actions'

import * as viewsConstants from '../../../state/views/constants'
import * as macroConstants from '../../../state/macro/constants'

const socket = socketio.connect(window.WS_URL, {transports: ['websocket']})

/**
 * Log sockets info only on dev environment
 */
const log = (...args) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(...args)
    }
}

let rooms = []

// singleton
let instance = null

export default class SocketIO {
    constructor(store) {
        // if already instanciated, return the instance
        if (instance) {
            return this
        }

        // set store only if a store is passed, used for dispatch actions in that store
        if (store) {
            this.store = store
        }

        socket.on('connect', this._onConnect)
        socket.on('message', this._onMessage)
        socket.on('json', this._onJSON)
        socket.on('disconnect', this._onDisconnect)
        socket.on('reconnect', this._onReconnect)
        socket.on('error', this._onError)

        instance = this
        return instance
    }

    _dispatch = (action) => {
        return this.store.dispatch(action)
    }

    _onConnect = () => {
        log('connected to ws')
    }

    _onReconnect = () => {
        log('reconnected')

        if (rooms.length) {
            log('joining rooms', rooms)
            rooms.forEach(this.join)
        }
    }

    _onDisconnect = () => {
        log('disconnected', arguments)
    }

    _onError = () => {
        log('error', arguments)
    }

    _onMessage = (event) => {
        log('event', event)
    }

    _onJSON = (json) => {
        const {event} = json

        if (!event) {
            return
        }

        const {type} = event

        if (!type) {
            return
        }

        switch (type) {
            case 'user-updated': {
                log('User updated', json)
                this._mergeUser(json.user)
                break
            }
            case 'user-location-updated': {
                log('User location updated', json)
                this._setAgentsLocation(json.locations)
                break
            }
            case 'user-typing-status-updated': {
                log('User typing status updated', json)
                this._setAgentsTypingStatus(json.locations)
                break
            }
            case 'ticket-updated': {
                log('Ticket updated', json)
                this._mergeTicket(json.ticket)
                this._sendTicketViewed(_get(json, 'ticket.id'))
                break
            }
            case 'ticket-deleted': {
                log('Ticket deleted', json)
                break
            }
            case 'ticket-message-created': {
                log('Message created', json)
                this._mergeTicket(json.ticket)
                this._sendTicketViewed(_get(json, 'ticket.id'))
                break
            }
            case 'ticket-message-action-failed': {
                log('Action failed on message', json)
                this._handleMessageActionFailed(json.ticket_id)
                break
            }
            case 'action-executed': {
                log('Action executed', json)
                this._handleExecutedAction(json)
                break
            }
            case 'view-created': {
                log('View created', json)
                this._handleViewCreated(json.view)
                break
            }
            case 'view-updated': {
                log('View updated', json)
                this._handleViewUpdated(json.view)
                break
            }
            case 'view-deleted': {
                log('View deleted', json)
                this._handleViewDeleted(json.view)
                break
            }
            case 'views-count-updated': {
                this._handleViewsCount(json)
                break
            }
            case 'macro-created': {
                log('Macro created', json)
                this._handleMacroCreated(json.macro)
                break
            }
            case 'macro-updated': {
                log('Macro updated', json)
                this._handleMacroUpdated(json.macro)
                break
            }
            case 'macro-deleted': {
                log('Macro deleted', json)
                this._handleMacroDeleted(json.macro)
                break
            }
            default:
                log('Received json', json)
                return
        }
    }

    /**
     * We throttle incoming events to prevent too frequent app update on client
     * @type {Function}
     * @private
     */
    _mergeTicket = _throttle(json => this._dispatch(ticketActions.mergeTicket(json)), 100)

    /**
     * We throttle incoming events to prevent too frequent app update on client
     * @type {Function}
     * @private
     */
    _mergeUser = _throttle((json) => this._dispatch(ticketActions.mergeRequester(json)), 100)

    /**
     * Update current location of agents in reducer
     */
    _setAgentsLocation = _throttle(json => this._dispatch(usersActions.setAgentsLocation(json)), 100)

    /**
     * Update current typing status of agents in reducer
     */
    _setAgentsTypingStatus = _throttle(json => this._dispatch(usersActions.setAgentsTypingStatus(json)), 100)

    /**
     * Inform the user that an action failed on one of its messages
     */
    _handleMessageActionFailed = _throttle(json => this._dispatch(ticketActions.handleMessageActionError(json)), 100)

    /**
     * Inform the user that an action failed on one of its messages
     */
    _handleExecutedAction = _throttle(json => this._dispatch(infobarActions.handleExecutedAction(json)), 100)

    _handleViewCreated = _throttle(resp => this._dispatch({type: viewsConstants.CREATE_VIEW_SUCCESS, resp}), 100)
    _handleViewUpdated = _throttle(resp => this._dispatch({type: viewsConstants.UPDATE_VIEW_SUCCESS, resp}), 100)
    _handleViewDeleted = _throttle(resp => this._dispatch(viewsActions.deleteViewSuccess(resp.id)), 100)
    _handleViewsCount = _throttle(json => this._dispatch(viewsActions.handleViewsCount(json)), 100)

    _handleMacroCreated = _throttle(resp => this._dispatch({type: macroConstants.CREATE_MACRO_SUCCESS, resp}), 100)
    _handleMacroUpdated = _throttle(resp => this._dispatch({type: macroConstants.UPDATE_MACRO_SUCCESS, resp}), 100)
    _handleMacroDeleted = _throttle(resp => this._dispatch({type: macroConstants.DELETE_MACRO_SUCCESS, resp}), 100)

    _sendTicketViewed = (ticketId) => {
        // if ticket is updated and user is currently on it, send a 'ticket viewed' event
        if (isCurrentlyOnTicket(ticketId)) {
            log('Ticket viewed sent for ticket', ticketId)
            this.send({
                event: 'ticket-viewed',
                ticketId,
            })
        }
    }

    disconnect = () => {
        socket.disconnect()
    }

    send = (args, ack) => {
        socket.send(args, ack)
    }

    saveJoin = (object) => {
        // leave all rooms of that object type
        this.saveLeave(object)

        // add the passed event
        rooms.push(object)
    }

    join = (args) => {
        // if no object id, we don't join anything
        if (!args.objectId) {
            return
        }

        const object = {
            ...args,
            event: 'join-room',
        }
        this.send(object)
        this.saveJoin(object)
    }

    saveLeave = (object) => {
        const type = object.objectType

        if (!type) {
            return
        }

        // remove all other joins of the same type
        rooms = _reject(rooms, {event: 'join-room', objectType: type})
    }

    leave = (args) => {
        // if no object id, we don't join anything
        if (!args.objectId) {
            return
        }

        const object = {
            ...args,
            event: 'leave-room',
        }
        this.send(object)
        this.saveLeave(object)
    }

    joinView = (id) => {
        log('Join view', id)
        this.join({
            objectType: 'View',
            objectId: id,
        })
    }

    joinUser = (id) => {
        log('Join user', id)
        this.join({
            objectType: 'User',
            objectId: id,
        })
    }

    joinTicket = (id) => {
        log('Join ticket', id)
        this.join({
            objectType: 'Ticket',
            objectId: id,
        })
    }

    leaveUser = (id) => {
        log('Leave user', id)
        this.leave({
            objectType: 'User',
            objectId: id,
        })
    }

    leaveTicket = (id) => {
        log('Leave ticket', id)
        this.leave({
            objectType: 'Ticket',
            objectId: id,
        })
        this.leaveTypingOnTicket(id)
    }

    joinTypingOnTicket = (id) => {
        log('Start typing on ticket', id)
        this.join({
            objectType: 'Ticket',
            objectId: id,
            action: 'typing'
        })
    }

    leaveTypingOnTicket = (id) => {
        log('Stopped typing on ticket', id)
        this.leave({
            objectType: 'Ticket',
            objectId: id,
            action: 'typing'
        })
    }
}
