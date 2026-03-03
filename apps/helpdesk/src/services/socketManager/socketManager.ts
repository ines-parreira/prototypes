import _find from 'lodash/find'
import _noop from 'lodash/noop'
import _throttle from 'lodash/throttle'
import { dismissNotification } from 'reapop'

import { AlertBannerTypes } from 'AlertBanners'
import { store } from 'common/store'
import { notify } from 'state/notifications/actions'
import { NotificationStyle } from 'state/notifications/types'
import type { StoreDispatch } from 'state/types'
import { devLog } from 'utils'

import {
    RELOAD_TAB_DELAY,
    SCOPED_BROADCAST_CHANNEL_NAME,
    SHARED_WORKER_NAME,
} from './constants'
import {
    fallbackBroadcastChannelAdapter,
    fallbackWorkerAdapter,
} from './fallbackWorkerAdapter'
import type {
    JoinEventType,
    ReceivedEvent,
    SendData,
    SendEvent,
    ServerMessage,
    WSMessage,
} from './types'
import {
    BroadcastChannelEvent,
    MessagePortEvent,
    SocketEventType,
} from './types'

const CONNECTION_TIMEOUT = 10

const currentBrowserSupportsSharedWorker =
    window.BroadcastChannel && window.SharedWorker

/**
 * Manage the connection with the shared worker that handles the websocket connection with the back-end.
 */
export class SocketManager {
    private joinEvents: SendEvent[] = []
    private receivedEvents: ReceivedEvent[] = []
    private sendEvents: SendEvent[] = []

    scopedBroadcastChannel = currentBrowserSupportsSharedWorker
        ? new window.BroadcastChannel(SCOPED_BROADCAST_CHANNEL_NAME)
        : fallbackBroadcastChannelAdapter
    isConnected = false
    disconnectedNotificationId = '696480246'
    outdatedNotificationId = 'outdated-shared-worker'
    rooms: SendData[] = [] // rooms currently joined
    worker = currentBrowserSupportsSharedWorker
        ? new window.SharedWorker(
              window.SHARED_WORKER_BUILD_URL,
              SHARED_WORKER_NAME,
          )
        : fallbackWorkerAdapter

    constructor() {
        this.worker.port.onmessage = (event: MessageEvent) =>
            this.onMessage(event.data)

        /**
         * If the connection has not been established after `CONNECTION_TIMEOUT` seconds, we call the `onDisconnect`
         * handler to display the banner to indicate connection is not established.
         */
        setTimeout(() => {
            if (!this.isConnected) {
                this.onDisconnect()
            }
        }, CONNECTION_TIMEOUT * 1000)

        this.scopedBroadcastChannel.addEventListener(
            'message',
            (event: MessageEvent) => {
                this.onMessage(event.data)
            },
        )

        this.worker.port.postMessage({
            type: MessagePortEvent.ClientConnected,
            wsUrl: window.WS_URL,
            clientId: window.CLIENT_ID,
        })
    }

    registerJoinEvents(events: SendEvent[]) {
        events.forEach((event) => this.joinEvents.push(event))
    }

    registerReceivedEvents(events: ReceivedEvent[]) {
        events.forEach((event) => this.receivedEvents.push(event))
    }

    registerSendEvents(events: SendEvent[]) {
        events.forEach((event) => this.sendEvents.push(event))
    }

    unregisterReceivedEvents(events: ReceivedEvent[]) {
        events.forEach((event) => {
            this.receivedEvents = this.receivedEvents.filter(
                (receivedEvent) => receivedEvent.name !== event.name,
            )
        })
    }

    onMessage = (message: WSMessage) => {
        switch (message.type) {
            case BroadcastChannelEvent.WsConnected:
                this.onConnect()
                break
            case BroadcastChannelEvent.WsDisconnected:
                this.onDisconnect()
                break
            case MessagePortEvent.HealthCheck:
                this.onHealthCheck()
                break
            case BroadcastChannelEvent.ReloadAllTabs:
                this.onReload()
                break
            case BroadcastChannelEvent.ServerMessage:
                this.onServerMessage(message.json as any)
                break
        }
    }

    onHealthCheck = () => {
        this.worker.port.postMessage({
            type: MessagePortEvent.HealthCheck,
            data: window.CLIENT_ID,
        })
    }

    onServerMessage = (json: Maybe<ServerMessage>) => {
        if (!json || !json.event || !json.event.type) {
            return
        }

        // find config of received event
        const config = _find(this.receivedEvents, {
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
                style: NotificationStyle.Banner,
                type: AlertBannerTypes.Critical,
                message: 'You are not connected to live ticket updates.',
                CTA: {
                    type: 'action',
                    text: 'Refresh',
                    onClick: this.resetWorker,
                },
            }),
        )
    }

    onConnect = () => {
        devLog('socket (re)connected')
        this.isConnected = true

        this.dispatchReduxAction(
            dismissNotification(this.disconnectedNotificationId),
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
     * socketManagerInstance.send('ticket-viewed', 12
     */
    send = (configName: SocketEventType, ...args: Array<any>) => {
        const config = _find(this.sendEvents, { name: configName })

        if (!config) {
            return
        }

        devLog('socket send', configName, args)

        this._sendToServer(config.dataToSend(...(args as any)))
    }

    /**
     * Send data needed to join a room on server from joinEvents configuration
     * @example
     * socketManagerInstance.join('ticket', 12
     */
    join = (configName: JoinEventType, ...args: Array<any>) => {
        const config = _find(this.joinEvents, { name: configName })

        if (!config) {
            return
        }

        this._joinRoom(config.dataToSend(...args))
    }

    /**
     * Send data needed to leave a room on server from joinEvents configuration
     * @example
     * socketManagerInstance.leave('ticket', 12)
     */
    leave = (configName: JoinEventType, ...args: Array<any>) => {
        const config = _find(this.joinEvents, { name: configName })

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
        return store.dispatch(data) as ReturnType<StoreDispatch>
    }, 100)

    /**
     * Send data to server via socket
     * @example
     * socketManagerInstance._sendToServer({event: 'ticket-viewed', ticketId: 12})
     */
    _sendToServer = (data: SendData, callback?: () => void) => {
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
     */
    _joinRoom = (data: SendData, callback: () => void = _noop) => {
        // if no object id or object type, we don't join anything
        if (!data.data || !data.dataType) {
            return
        }

        const roomData = {
            clientId: window.CLIENT_ID,
            event: SocketEventType.RoomJoined,
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
     */
    _saveJoinRoom = (data: SendData) => {
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
     */
    _leaveRoom = (data: SendData, callback: () => void = _noop) => {
        // if no object id or object type, we don't leave anything
        if (!data.data || !data.dataType) {
            return
        }

        const roomData = {
            clientId: window.CLIENT_ID,
            event: SocketEventType.RoomLeft,
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
     */
    _saveLeaveRoom = (data: SendData) => {
        // remove all rooms of same dataType as passed data
        this.rooms = this.rooms.filter(
            (roomData: Record<string, unknown>): boolean =>
                roomData.dataType !== data.dataType,
        )
    }

    onReload = () => {
        window.location.reload()
    }

    resetWorker = () => {
        this.worker.port.postMessage({
            type: MessagePortEvent.TerminateWorker,
        })
        window.setTimeout(() => {
            this.scopedBroadcastChannel.postMessage({
                type: BroadcastChannelEvent.ReloadAllTabs,
            })
            this.onReload()
        }, RELOAD_TAB_DELAY * 1000)
    }
}

const socketManager = new SocketManager()

export default socketManager
