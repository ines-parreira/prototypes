/**
 * Shared Worker adapter for browsers which don't support SharedWorkers and/or BroadcastChannels
 * =========================================================================================
 *
 * We now use a `SharedWorker` to use a single websocket connection for multiple tabs of a single browser window.
 * Though, some browsers (like Safari) do not support `SharedWorkers` and/or `BroadcastChannels`, so we've had to
 * create this adapter that behaves like the `SharedWorker` would, except it runs in the tab directly.
 */
import io, {Socket} from 'socket.io-client'
import _noop from 'lodash/noop'

import {SegmentEvent, logEvent} from 'store/middlewares/segmentTracker'

import {WSMessage, BroadcastChannelEvent} from './types'
import {
    MAX_INCREMENTAL_RECONNECT_BACKOFF,
    DISCONNECTED_NOTIFICATION_DELAY,
} from './constants'

export class FallbackWorker {
    socket: Socket | null = null

    incrementalReconnectBackoff = 1
    incrementalReconnectTask: NodeJS.Timeout | null = null

    sendDisconnectedNotificationTask: NodeJS.Timeout | null = null

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
        fallbackWorkerAdapter.postMessage({
            type: BroadcastChannelEvent.ServerMessage,
            json: wsMessage,
        })
    }

    _onSocketConnect = () => {
        // eslint-disable-next-line no-console
        console.log('WS connected!')
        fallbackBroadcastChannelAdapter.postMessage({
            type: BroadcastChannelEvent.WsConnected,
        })

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
            () =>
                fallbackBroadcastChannelAdapter.postMessage({
                    type: BroadcastChannelEvent.WsDisconnected,
                }),
            DISCONNECTED_NOTIFICATION_DELAY * 1000
        )

        // After a disconnection, we might need to reconnect manually as the client will not try to reconnect
        // automatically. See: https://github.com/socketio/socket.io-client/issues/1067
        this.incrementalReconnect()
    }

    onConnect = () => {
        if (!this.socket) {
            this.socket = io(window.WS_URL, {
                transports: ['websocket'],
                path: '/socket.io/v4/',
            })

            this.socket.on('json', this._onSocketJson)
            this.socket.on('connect', this._onSocketConnect)
            this.socket.on('disconnect', this._onSocketDisconnect)
        } else {
            fallbackWorkerAdapter.postMessage({
                type: BroadcastChannelEvent.WsConnected,
            })
        }
    }

    onMessage = (message: WSMessage) => {
        if (this.socket) {
            this.socket.send(message)
        }
    }
}

const fallbackWorker = new FallbackWorker()

export const fallbackWorkerAdapter = {
    port: {
        start: () => {
            logEvent(SegmentEvent.FallbackWorkerStarted)
            fallbackWorker.onConnect()
        },
        postMessage: (message: WSMessage) => fallbackWorker.onMessage(message),
        onmessage: _noop,
    },
    postMessage: (message: WSMessage) =>
        fallbackWorkerAdapter.port.onmessage({data: message}),
}

export const fallbackBroadcastChannelAdapter = {
    addEventListener: (
        event: string,
        handler: (event: MessageEvent) => void
    ) => {
        fallbackBroadcastChannelAdapter.onmessage = handler
    },
    onmessage: _noop,
    postMessage: (message: WSMessage) =>
        fallbackBroadcastChannelAdapter.onmessage({data: message}),
}
