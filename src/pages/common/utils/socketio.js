import socketio from 'socket.io-client'
import {
    mergeTicket,
    mergeRequester,
} from '../../../state/ticket/actions'
import _throttle from 'lodash/throttle'
import _reject from 'lodash/reject'

const socket = socketio.connect(window.WS_URL)

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

        const pollingConfiguration = window.DISABLE_ACTIVITY_POLLING || 'False'
        if (pollingConfiguration !== 'False') {
            return
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
        log('received json', json)
        const {event} = json

        if (!(event && event.type)) {
            return
        }

        switch (event.type) {
            case 'ticket-viewed': {
                break
            }
            case 'user-updated': {
                log('User updated', json)
                this._mergeUser(json.user)
                break
            }
            case 'ticket-updated': {
                log('Ticket updated', json)
                this._mergeTicket(json.ticket)
                break
            }
            case 'ticket-deleted': {
                log('Ticket deleted', json)
                break
            }
            case 'ticket-message-created': {
                log('Message created', json)
                this._mergeTicket(json.ticket)
                break
            }
            default:
                return
        }
    }

    /**
     * We throttle incoming events to prevent too frequent app update on client
     * @type {Function}
     * @private
     */
    _mergeTicket = _throttle(json => this._dispatch(mergeTicket(json)), 100)

    /**
     * We throttle incoming events to prevent too frequent app update on client
     * @type {Function}
     * @private
     */
    _mergeUser = _throttle((json) => {
        // merge updated user with requester of ticket
        this._dispatch(mergeRequester(json))
    }, 100)

    disconnect = () => {
        socket.disconnect()
    }

    send = (args, ack) => {
        socket.send(args, ack)
    }

    saveJoin = (object) => {
        const type = object.objectType

        if (!type) {
            return
        }

        // remove all other joins of the same type
        rooms = _reject(rooms, {event: 'join-room', objectType: type})

        // add the passed event
        rooms.push(object)
    }

    join = (args) => {
        const object = {
            ...args,
            event: 'join-room',
        }
        this.send(object)
        this.saveJoin(object)
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
}
