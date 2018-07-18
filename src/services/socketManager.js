import io from 'socket.io-client'
import _noop from 'lodash/noop'
import _find from 'lodash/find'
import _throttle from 'lodash/throttle'

import * as socketEvents from '../config/socketEvents'

import {store} from '../init'
import {devLog} from '../utils'
import {ROOM_JOINED, ROOM_LEFT} from '../config/socketConstants'

/**
 * Manage active socket of app
 */
class SocketManager {
    constructor() {
        // instantiate socket connection
        this.socket = io.connect(window.WS_URL, {transports: ['websocket']})

        // array of data of currently joined rooms
        this.roomsData = []

        // bind socket events
        this.socket.on('connect', this.onConnect)
        this.socket.on('json', this.onJSON)
        this.socket.on('disconnect', this.onDisconnect)
        this.socket.on('reconnect', this.onReconnect)
        this.socket.on('error', this.onError)

        // retrieve configuration
        this.joinEvents = socketEvents.joinEvents
        this.receivedEvents = socketEvents.receivedEvents
        this.sendEvents = socketEvents.sendEvents
    }

    onConnect = () => {
        devLog('socket connected')
    }

    onJSON = (json) => {
        const {event} = json

        if (!event) {
            return
        }

        const {type} = event

        if (!type) {
            return
        }

        // find config of received event
        const config = _find(this.receivedEvents, {name: type})

        if (!config) {
            return
        }

        devLog('JSON received for event', config.name, json)
        // bind current SocketManager instance to onReceive function on call
        return config.onReceive.call(this, json)
    }

    onDisconnect = () => {
        devLog('socket disconnected')
    }

    onReconnect = () => {
        devLog('socket reconnected')

        // join rooms that were active before being disconnected
        if (this.roomsData.length) {
            devLog('joining rooms', this.roomsData)
            this.roomsData.forEach((roomData) => this._joinRoom(roomData))
        }
    }

    onError = () => {
        devLog('socket error', arguments)
    }

    /**
     * Send an event from sendEvents configuration
     * @example
     * socketManagerInstance.send('ticket-viewed', 12)
     * @param configName
     * @param args all other arguments passed to the function
     */
    send = (configName, ...args) => {
        const config = _find(this.sendEvents, {name: configName})

        if (!config) {
            return
        }

        devLog('socket send', configName, args)

        return this._sendToServer(config.dataToSend(...args))
    }

    /**
     * Send data needed to join a room on server from joinEvents configuration
     * @example
     * socketManagerInstance.join('ticket', 12)
     * @param configName
     * @param args all other arguments passed to the function
     */
    join = (configName, ...args) => {
        const config = _find(this.joinEvents, {name: configName})

        if (!config) {
            return
        }

        return this._joinRoom(config.dataToSend(...args), () => {
            if (config.onJoin) {
                // bind current SocketManager instance to onJoin function on call
                return config.onJoin.call(this, ...args)
            }
        })
    }

    /**
     * Send data needed to leave a room on server from joinEvents configuration
     * @example
     * socketManagerInstance.leave('ticket', 12)
     * @param configName
     * @param args all other arguments passed to the function
     */
    leave = (configName, ...args) => {
        const config = _find(this.joinEvents, {name: configName})

        if (!config) {
            return
        }

        return this._leaveRoom(config.dataToSend(...args), () => {
            if (config.onLeave) {
                // bind current SocketManager instance to onLeave function on call
                return config.onLeave.call(this, ...args)
            }
        })
    }

    /**
     * Force socket disconnection
     */
    disconnect = () => {
        return this.socket.disconnect()
    }

    /**
     * Dispatch action to store
     * Throttled to prevent a too high frequency of state refresh
     */
    dispatch = _throttle((data) => {
        return store.dispatch(data)
    }, 100)

    /**
     * Send data to server via socket
     * @example
     * socketManagerInstance._sendToServer({event: 'ticket-viewed', ticketId: 12})
     * @param data
     * @param callback
     */
    _sendToServer = (data, callback) => {
        return this.socket.send(data, callback)
    }

    /**
     * Send data needed to join a room on server
     * Add this data to array of current joined rooms (used when reconnecting)
     * @example
     * socketManagerInstance._joinRoom({dataType: 'Ticket', data: 12})
     * @param data
     * @param callback
     */
    _joinRoom = (data, callback = _noop) => {
        // if no object id or object type, we don't join anything
        if (!data.data || !data.dataType) {
            return
        }

        const roomData = {
            clientId: window.CLIENT_ID,
            event: ROOM_JOINED,
            dataType: data.dataType,
            data: data.data,
        }

        devLog('socket join room', roomData)

        // join room
        return this._sendToServer(roomData, (...args) => {
            // add this room to current rooms data
            this._saveJoinRoom(data)

            // call callback if any
            return callback(...args)
        })
    }

    /**
     * Add room data to array of current joined rooms (used when reconnecting)
     * @example
     * socketManagerInstance._saveJoinRoom({event: 'join-room', dataType: 'Ticket', data: 12})
     * @param data
     */
    _saveJoinRoom = (data) => {
        // leave other rooms of same dataType
        this._saveLeaveRoom(data)
        // add this room to current rooms
        this.roomsData.push(data)
    }

    /**
     * Send data needed to leave a room on server
     * Remove this data from array of current joined rooms (used when reconnecting)
     * @example
     * socketManagerInstance._leaveRoom({dataType: 'Ticket', data: 12})
     * @param data
     * @param callback
     */
    _leaveRoom = (data, callback = _noop) => {
        // if no object id or object type, we don't leave anything
        if (!data.data || !data.dataType) {
            return
        }

        const roomData = {
            clientId: window.CLIENT_ID,
            event: ROOM_LEFT,
            dataType: data.dataType,
            data: data.data,
        }

        devLog('socket leave room', roomData)

        // leave any room of that type
        return this._sendToServer(roomData, (...args) => {
            // remove this room type from current rooms data
            this._saveLeaveRoom(data)

            // call callback if any
            return callback(...args)
        })
    }

    /**
     * Remove room data from array of current joined rooms (used when reconnecting)
     * @example
     * socketManagerInstance._saveJoinRoom({event: 'leave-room', dataType: 'Ticket', data: 12})
     * @param data
     */
    _saveLeaveRoom = (data) => {
        // remove all rooms of same dataType as passed data
        this.roomsData = this.roomsData.filter((roomData) => {
            return roomData.dataType !== data.dataType
        })
    }
}

export default new SocketManager()
