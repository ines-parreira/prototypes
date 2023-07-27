/**
 * Websocket Shared Worker
 * =======================
 *
 * This file creates a shared worker (a single background worker used by all tabs opened on Gorgias in a single
 * browser window) which takes care of the websocket connection between a browser window and the socketio backend. It
 * allows using a single websocket connection for multiple Gorgias tabs in a single browser window, thus reducing the
 * total number of connections to our server.
 *
 *
 * #### Health check
 *
 * There is no way to know, after a tab has been connected to this worker, if it is still opened or not. In order
 * to have this information, we've created a health check:
 * - every second, the worker send a HEALTH_CHECK message to all connected tabs (`connectedTabs`)
 * - when tabs receive this message, they reply with the same HEALTH_CHECK message
 * - once the worker receives a reply from a tab, it is registered with a `lastHealthCheck` timestamp
 * - this timestamp is updated every second
 * - every 10 seconds, the worker considers all tabs that have a `lastHealthCheck` timestamp older than 5 seconds as
 * disconnected, removes them from the list of connected tabs, and sends a message to the server indicating
 * this specific client was disconnected
 *
 *
 * Inspired by https://ayushgp.github.io/scaling-websockets-using-sharedworkers/
 */

import io, {Socket} from 'socket.io-client'

import {
    BROADCAST_CHANNEL_NAME,
    MAX_INCREMENTAL_RECONNECT_BACKOFF,
    DISCONNECTED_NOTIFICATION_DELAY,
    HEALTH_CHECK_INTERVAL,
    HEALTH_CHECK_RECEIVE_TIMEOUT,
    HEALTH_CHECK_SEND_INTERVAL,
    SHARED_WORKER_VERSION,
} from './constants'
import {
    WSMessage,
    MessagePortEvent,
    BroadcastChannelEvent,
    SocketEvent,
} from './types'

export class WebsocketSharedWorker {
    wsUrl: string | null = null
    socket: Socket | null = null

    broadcastChannel = new self.BroadcastChannel(BROADCAST_CHANNEL_NAME)

    incrementalReconnectBackoff = 1
    incrementalReconnectTask: NodeJS.Timeout | null = null

    sendDisconnectedNotificationTask: NodeJS.Timeout | null = null

    connectedTabs: Record<
        string,
        {
            messagePort: MessagePort
            lastHealthCheck: number
        }
    > = {}

    startHealthCheck() {
        setInterval(this.sendHealthCheck, HEALTH_CHECK_SEND_INTERVAL * 1000)
        setInterval(this.disconnectTabs, HEALTH_CHECK_INTERVAL * 1000)
    }

    sendHealthCheck = () => {
        Object.keys(this.connectedTabs).forEach((clientId) => {
            this.connectedTabs[clientId].messagePort.postMessage({
                type: MessagePortEvent.HealthCheck,
            })
        })
    }

    onHealthCheck = (clientId: string) => {
        if (this.connectedTabs[clientId]) {
            this.connectedTabs[clientId].lastHealthCheck = Date.now()
        }
    }

    disconnectTabs = () => {
        const currentTime = Date.now()
        Object.entries(this.connectedTabs).forEach(([clientId, tab]) => {
            if (
                tab.lastHealthCheck <
                currentTime - HEALTH_CHECK_RECEIVE_TIMEOUT * 1000
            ) {
                this.socket?.send({
                    event: SocketEvent.ClientDisconnected,
                    clientId,
                })
                delete this.connectedTabs[clientId]
            }
        })
    }

    incrementalReconnect = () => {
        // eslint-disable-next-line no-console
        console.log(`Reconnecting in ${this.incrementalReconnectBackoff}`)

        this.incrementalReconnectTask = setTimeout(() => {
            // eslint-disable-next-line no-console
            console.log('Reconnecting...')
            this.socket?.connect()

            this.incrementalReconnectBackoff = Math.min(
                this.incrementalReconnectBackoff * 2,
                MAX_INCREMENTAL_RECONNECT_BACKOFF
            )

            this.incrementalReconnect()
        }, this.incrementalReconnectBackoff * 1000)
    }

    _onSocketJson = (wsMessage: WSMessage['json']) => {
        this.broadcastChannel.postMessage({
            type: BroadcastChannelEvent.ServerMessage,
            json: wsMessage,
        })
    }

    _onSocketConnect = () => {
        // eslint-disable-next-line no-console
        console.log('WS connected!')
        this.broadcastChannel.postMessage({
            type: BroadcastChannelEvent.WsConnected,
        })

        if (this.incrementalReconnectTask) {
            this.incrementalReconnectBackoff = 1
            clearTimeout(this.incrementalReconnectTask)
            this.incrementalReconnectTask = null
        }

        if (this.sendDisconnectedNotificationTask) {
            clearTimeout(this.sendDisconnectedNotificationTask)
        }
    }

    _onSocketDisconnect = () => {
        // eslint-disable-next-line no-console
        console.log('WS disconnected!')

        this.sendDisconnectedNotificationTask = setTimeout(
            () =>
                this.broadcastChannel.postMessage({
                    type: BroadcastChannelEvent.WsDisconnected,
                }),
            DISCONNECTED_NOTIFICATION_DELAY * 1000
        )

        // https://linear.app/gorgias/issue/PLTOF-236/sharedworker-spawns-new-retry-loops
        if (!this.incrementalReconnectTask) {
            // After a disconnection, we might need to reconnect manually as the client will not try to reconnect
            // automatically. See: https://github.com/socketio/socket.io-client/issues/1067
            this.incrementalReconnect()
        }
    }

    /**
     * Called when receiving a `SOCKET_EVENTS.CLIENT_CONNECTED` message from a tab newly connected to the shared worker:
     * - if there is no active connection with the SocketIO server yet, the worker uses the `WS_URL` provided in the
     * `CLIENT_CONNECTED` message to open a websocket connection with the SocketIO server
     * - if there is already an active connection with the SocketIO server, we send a `WS_CONNECTED` event to the
     * newly connected tab, so that it knows that it's now correctly connected to the server, and so that it doesn't
     * display the "You're not connected" bar notification at the top of the window.
     *
     *
     * @param message: the message sent by the newly connected tab
     * @param messagePort: the `MessagePort` associated with the newly connected tab
     */
    onClientConnected = (message: WSMessage, messagePort: MessagePort) => {
        if (!this.socket) {
            this.wsUrl = message.wsUrl!
            this.socket = io(this.wsUrl, {
                transports: ['websocket'],
                path: '/socket.io/v4/',
            })

            this.socket.on('json', this._onSocketJson)
            this.socket.on('connect', this._onSocketConnect)
            this.socket.on('disconnect', this._onSocketDisconnect)
        } else {
            messagePort.postMessage({
                type: BroadcastChannelEvent.WsConnected,
            })
        }

        this.connectedTabs[message.clientId!] = {
            messagePort,
            lastHealthCheck: Date.now(),
        }

        this.socket.send({
            event: SocketEvent.ClientConnected,
            clientId: message.clientId,
        })
    }

    /**
     * Generate a handler method to call when getting a new message on a specific `MessagePort`.
     *
     * @param messagePort: the `MessagePort` for which we want to generate a message handler
     * @returns {Function}: the message handler generated
     */
    onPortMessage =
        (messagePort: MessagePort) =>
        (messageEvent: MessageEvent<WSMessage>) => {
            const message = messageEvent.data

            if (message.type === MessagePortEvent.ClientConnected) {
                this.onClientConnected(message, messagePort)
            } else if (message.type === MessagePortEvent.HealthCheck) {
                this.onHealthCheck(message.data as string)
            } else if (message.type === MessagePortEvent.GetVersion) {
                this._broadcastVersion()
            } else if (this.socket) {
                this.socket.send(message)
            }
        }

    onPortConnect = (event: MessageEvent) => {
        event.ports[0].onmessage = this.onPortMessage(event.ports[0])
    }

    _broadcastVersion = () => {
        this.broadcastChannel.postMessage({
            type: BroadcastChannelEvent.Version,
            data: SHARED_WORKER_VERSION,
        })
    }
}

const worker = new WebsocketSharedWorker()
worker.startHealthCheck()
;(self as unknown as Record<string, unknown>).onconnect = worker.onPortConnect
