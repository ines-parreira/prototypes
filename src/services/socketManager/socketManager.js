// @flow
import _noop from 'lodash/noop'
import _find from 'lodash/find'
import _throttle from 'lodash/throttle'
import {removeNotification} from 'reapop'

import * as socketEvents from '../../config/socketEvents'
import {notify} from '../../state/notifications/actions.ts'
import {store} from '../../init'
import {devLog} from '../../utils.ts'
import {ROOM_JOINED, ROOM_LEFT} from '../../config/socketConstants'

import {
    BROADCAST_CHANNEL_EVENTS,
    BROADCAST_CHANNEL_NAME,
    MESSAGE_PORT_EVENTS,
} from './constants'
import {
    fallbackBroadcastChannelAdapter,
    fallbackWorkerAdapter,
} from './fallbackWorkerAdapter'
import type {ServerMessage} from './types'

type BroadcastEvents = $Values<typeof BROADCAST_CHANNEL_EVENTS>
type PortEvents = $Values<typeof MESSAGE_PORT_EVENTS>

type WSMessage = {
    type: BroadcastEvents | PortEvents,
    json: ?ServerMessage,
}

const CONNECTION_TIMEOUT = 10

const currentBrowserSupportsSharedWorker =
    window.BroadcastChannel && window.SharedWorker

/**
 * Manage the connection with the shared worker that handles the websocket connection with the back-end.
 */
export class SocketManager {
    broadcastChannel = currentBrowserSupportsSharedWorker
        ? new window.BroadcastChannel(BROADCAST_CHANNEL_NAME)
        : fallbackBroadcastChannelAdapter
    isConnected = false
    disconnectedNotificationId = '696480246'
    rooms: Array<*> = [] // rooms currently joined
    worker = currentBrowserSupportsSharedWorker
        ? new window.SharedWorker(
              window.SHARED_WORKER_BUILD_URL,
              'WebsocketSharedWorker'
          )
        : fallbackWorkerAdapter

    constructor() {
        this.worker.port.start()
        this.worker.port.onmessage = (event) => this.onMessage(event.data)

        /**
         * If the connection has not been established after `CONNECTION_TIMEOUT` seconds, we call the `onDisconnect`
         * handler to display the banner to indicate connection is not established.
         */
        setTimeout(() => {
            if (!this.isConnected) {
                this.onDisconnect()
            }
        }, CONNECTION_TIMEOUT * 1000)

        this.broadcastChannel.addEventListener('message', (event) => {
            this.onMessage(event.data)
        })

        this.worker.port.postMessage({
            type: MESSAGE_PORT_EVENTS.CLIENT_CONNECTED,
            wsUrl: window.WS_URL,
            clientId: window.CLIENT_ID,
        })
    }

    onMessage = (message: WSMessage) => {
        switch (message.type) {
            case BROADCAST_CHANNEL_EVENTS.WS_CONNECTED:
                this.onConnect()
                break
            case BROADCAST_CHANNEL_EVENTS.WS_DISCONNECTED:
                this.onDisconnect()
                break
            case MESSAGE_PORT_EVENTS.HEALTH_CHECK:
                this.onHealthCheck()
                break
            case BROADCAST_CHANNEL_EVENTS.SERVER_MESSAGE:
                this.onServerMessage(message.json)
        }
    }

    onHealthCheck = () => {
        this.worker.port.postMessage({
            type: MESSAGE_PORT_EVENTS.HEALTH_CHECK,
            data: window.CLIENT_ID,
        })
    }

    onServerMessage = (json: ?ServerMessage) => {
        if (!json || !json.event || !json.event.type) {
            return
        }

        // find config of received event
        const config = _find(socketEvents.receivedEvents, {
            name: json.event.type,
        })
        if (!config) {
            return
        }

        devLog('JSON received for event', config.name, json)
        // bind current SocketManager instance to onReceive function on call
        // $FlowFixMe
        config.onReceive.call(this, json)
    }

    onDisconnect = () => {
        this.isConnected = false
        this.dispatchReduxAction(
            notify({
                id: this.disconnectedNotificationId,
                style: 'banner',
                status: 'error',
                dismissible: false,
                message:
                    'You are not connected to live ticket updates. <u>Please reload the page</u>',
                onClick: () => window.location.reload(false),
            })
        )
    }

    onConnect = () => {
        devLog('socket (re)connected')
        this.isConnected = true

        this.dispatchReduxAction(
            removeNotification(this.disconnectedNotificationId)
        )

        // join rooms that were active before being disconnected
        if (this.rooms.length) {
            devLog('joining rooms', this.rooms)
            this.rooms.forEach((roomData) => this._joinRoom(roomData))
        }
    }

    /**
     * Send an event from sendEvents configuration
     * @example
     * socketManagerInstance.send('ticket-viewed', 12)
     * @param configName
     * @param args all other arguments passed to the function
     */
    send = (configName: string, ...args: Array<*>) => {
        const config = _find(socketEvents.sendEvents, {name: configName})

        if (!config) {
            return
        }

        devLog('socket send', configName, args)

        this._sendToServer(config.dataToSend(...(args: any)))
    }

    /**
     * Send data needed to join a room on server from joinEvents configuration
     * @example
     * socketManagerInstance.join('ticket', 12)
     * @param configName
     * @param args all other arguments passed to the function
     */
    join = (configName: string, ...args: Array<*>) => {
        const config = _find(socketEvents.joinEvents, {name: configName})

        if (!config) {
            return
        }

        this._joinRoom(config.dataToSend(...args))
    }

    /**
     * Send data needed to leave a room on server from joinEvents configuration
     * @example
     * socketManagerInstance.leave('ticket', 12)
     * @param configName
     * @param args all other arguments passed to the function
     */
    leave = (configName: string, ...args: Array<*>) => {
        const config = _find(socketEvents.joinEvents, {name: configName})

        if (!config) {
            return
        }

        this._leaveRoom(config.dataToSend(...args), () => {
            if (config.onLeave) {
                // bind current SocketManager instance to onLeave function on call
                return config.onLeave.call(this, ...args)
            }
        })
    }

    /**
     * Dispatch action to store
     * Throttled to prevent a too high frequency of state refresh
     */
    dispatchReduxAction = _throttle((data) => {
        return store.dispatch(data)
    }, 100)

    /**
     * Send data to server via socket
     * @example
     * socketManagerInstance._sendToServer({event: 'ticket-viewed', ticketId: 12})
     * @param data
     * @param callback
     */
    _sendToServer = (data: Object, callback?: () => *) => {
        this.worker.port.postMessage(data)

        if (callback) {
            callback()
        }
    }

    /**
     * Send data needed to join a room on server
     * Add this data to array of current joined rooms (used when reconnecting)
     * @example
     * socketManagerInstance._joinRoom({dataType: 'Ticket', data: 12})
     * @param data
     * @param callback
     */
    _joinRoom = (data: Object, callback?: () => * = _noop) => {
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
        this._sendToServer(roomData, (...args) => {
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
    _saveJoinRoom = (data: Object) => {
        // leave other rooms of same dataType
        this._saveLeaveRoom(data)
        // add this room to current rooms
        this.rooms.push(data)
    }

    /**
     * Send data needed to leave a room on server
     * Remove this data from array of current joined rooms (used when reconnecting)
     * @example
     * socketManagerInstance._leaveRoom({dataType: 'Ticket', data: 12})
     * @param data
     * @param callback
     */
    _leaveRoom = (data: Object, callback?: () => * = _noop) => {
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
        this._sendToServer(roomData, (...args) => {
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
    _saveLeaveRoom = (data: Object) => {
        // remove all rooms of same dataType as passed data
        this.rooms = this.rooms.filter(
            (roomData: Object): boolean => roomData.dataType !== data.dataType
        )
    }
}

export default new SocketManager()
