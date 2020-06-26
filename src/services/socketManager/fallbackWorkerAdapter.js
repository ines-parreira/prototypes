/**
 * Shared Worker adapter for browsers which don't support SharedWorkers and/or BroadcastChannels
 * =========================================================================================
 *
 * We now use a `SharedWorker` to use a single websocket connection for multiple tabs of a single browser window.
 * Though, some browsers (like Safari) do not support `SharedWorkers` and/or `BroadcastChannels`, so we've had to
 * create this adapter that behaves like the `SharedWorker` would, except it runs in the tab directly.
 */
import io from 'socket.io-client'

import {BROADCAST_CHANNEL_EVENTS} from './constants'

export const MAX_INCREMENTAL_RECONNECT_BACKOFF = 30
export const DISCONNECTED_NOTIFICATION_DELAY = 10


export class FallbackWorker {
    socket = null

    incrementalReconnectBackoff = 1
    incrementalReconnectTask = null

    sendDisconnectedNotificationTask = null

    incrementalReconnect = () => {
        // eslint-disable-next-line no-console
        console.log(`Reconnecting in ${this.incrementalReconnectBackoff}`)

        this.incrementalReconnectTask = setTimeout(() => {
            // eslint-disable-next-line no-console
            console.log('Reconnecting...')
            this.socket.connect()

            this.incrementalReconnectBackoff = Math.min(
                this.incrementalReconnectBackoff * 2,
                MAX_INCREMENTAL_RECONNECT_BACKOFF
            )

            this.incrementalReconnect()
        }, this.incrementalReconnectBackoff * 1000)
    }

    _onSocketJson = (wsMessage) => {
        fallbackWorkerAdapter.postMessage({type: BROADCAST_CHANNEL_EVENTS.SERVER_MESSAGE, json: wsMessage})
    }

    _onSocketConnect = () => {
        // eslint-disable-next-line no-console
        console.log('WS connected!')
        fallbackBroadcastChannelAdapter.postMessage({type: BROADCAST_CHANNEL_EVENTS.WS_CONNECTED})

        if (this.incrementalReconnectTask) {
            this.incrementalReconnectBackoff = 1
            clearTimeout(this.incrementalReconnectTask)
        }

        if (this.sendDisconnectedNotificationTask) {
            clearTimeout(this.sendDisconnectedNotificationTask)
        }
    }

    _onSocketDisconnect = () => {
        // eslint-disable-next-line no-console
        console.log('WS disconnected!')

        this.sendDisconnectedNotificationTask = setTimeout(
            () => fallbackBroadcastChannelAdapter.postMessage({type: BROADCAST_CHANNEL_EVENTS.WS_DISCONNECTED}),
            DISCONNECTED_NOTIFICATION_DELAY * 1000
        )

        // After a disconnection, we might need to reconnect manually as the client will not try to reconnect
        // automatically. See: https://github.com/socketio/socket.io-client/issues/1067
        this.incrementalReconnect()
    }

    onConnect = () => {
        if (!this.socket) {
            this.socket = io(window.WS_URL, {transports: ['websocket']})

            this.socket.on('json', this._onSocketJson)
            this.socket.on('connect', this._onSocketConnect)
            this.socket.on('disconnect', this._onSocketDisconnect)
        } else {
            fallbackWorkerAdapter.postMessage({type: BROADCAST_CHANNEL_EVENTS.WS_CONNECTED})
        }
    }

    onMessage = (message) => {
        if (this.socket) {
            this.socket.send(message)
        }
    }
}

const fallbackWorker = new FallbackWorker()

export const fallbackWorkerAdapter = {
    port: {
        start: () => fallbackWorker.onConnect(),
        postMessage: ((message) => fallbackWorker.onMessage(message)),
        onmessage: () => {}
    },
    postMessage: (message) => fallbackWorkerAdapter.port.onmessage({data: message}),
}

export const fallbackBroadcastChannelAdapter = {
    addEventListener: (_, handler) => {
        fallbackBroadcastChannelAdapter.onmessage = handler
    },
    onmessage: () => {},
    postMessage: (message) => fallbackBroadcastChannelAdapter.onmessage({data: message}),
}
