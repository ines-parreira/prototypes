/**
 * Shared Worker adapter for browsers which don't support SharedWorkers and/or BroadcastChannels
 * =========================================================================================
 *
 * We now use a `SharedWorker` to use a single websocket connection for multiple tabs of a single browser window.
 * Though, some browsers (like Safari) do not support `SharedWorkers` and/or `BroadcastChannels`, so we've had to
 * create this adapter that behaves like the `SharedWorker` would, except it runs in the tab directly.
 */
import { logEvent, SegmentEvent } from '@repo/logging'
import _noop from 'lodash/noop'
import io, { Socket } from 'socket.io-client'

import {
    DISCONNECTED_NOTIFICATION_DELAY,
    INCREMENTAL_RECONNECT_BACKOFF,
    INTERNAL_SERVER_CONNECTION_ERROR_MESSAGE,
    MAX_INCREMENTAL_RECONNECT_BACKOFF,
} from './constants'
import IncrementalBackoff from './incrementalBackoff'
import { BroadcastChannelEvent, WSMessage } from './types'

export class FallbackWorker {
    socket: Socket | null = null

    sendDisconnectedNotificationTask: NodeJS.Timeout | null = null

    reconnectBackoff = new IncrementalBackoff({
        initialDelay: INCREMENTAL_RECONNECT_BACKOFF * 1000,
        maxDelay: MAX_INCREMENTAL_RECONNECT_BACKOFF * 1000,
    })

    _onSocketJson = (wsMessage: WSMessage['json']) => {
        fallbackWorkerAdapter.postMessage({
            type: BroadcastChannelEvent.ServerMessage,
            json: wsMessage,
        })
    }

    _onSocketConnect = () => {
        // eslint-disable-next-line no-console
        console.log('WS connected!')
        fallbackWorkerAdapter.postMessage({
            type: BroadcastChannelEvent.WsConnected,
        })

        if (this.sendDisconnectedNotificationTask) {
            clearTimeout(this.sendDisconnectedNotificationTask)
            this.sendDisconnectedNotificationTask = null
        }

        this.reconnectBackoff.reset()
    }

    _onSocketConnectError = (error: Error) => {
        // eslint-disable-next-line no-console
        console.log('WS connect error!', error.message)
        this.scheduleDisconnectedNotificationTask()

        if (error.message === INTERNAL_SERVER_CONNECTION_ERROR_MESSAGE) {
            this.reconnectBackoff.scheduleCall((attempt) => {
                this._onSocketReconnectAttempt(attempt)
                this.socket?.connect()
            })
        }
    }

    _onSocketDisconnect = (reason: string) => {
        // eslint-disable-next-line no-console
        console.log('WS disconnected!', reason)
        this.scheduleDisconnectedNotificationTask()
    }

    _onSocketReconnectAttempt = (attempt: number) => {
        // eslint-disable-next-line no-console
        console.log('Reconnect attempt', attempt)
    }

    private scheduleDisconnectedNotificationTask = () => {
        if (this.sendDisconnectedNotificationTask) {
            return
        }
        this.sendDisconnectedNotificationTask = setTimeout(
            () =>
                fallbackWorkerAdapter.postMessage({
                    type: BroadcastChannelEvent.WsDisconnected,
                }),
            DISCONNECTED_NOTIFICATION_DELAY * 1000,
        )
    }

    onConnect = () => {
        if (!this.socket) {
            this.socket = io(window.WS_URL, {
                transports: ['websocket'],
                path: '/socket.io/v4/',
                reconnectionDelay: INCREMENTAL_RECONNECT_BACKOFF * 1000,
                reconnectionDelayMax: MAX_INCREMENTAL_RECONNECT_BACKOFF * 1000,
            })

            this.socket.on('json', this._onSocketJson)
            this.socket.on('connect', this._onSocketConnect)
            this.socket.on('disconnect', this._onSocketDisconnect)
            this.socket.on('connect_error', this._onSocketConnectError)
            this.socket.io.on(
                'reconnect_attempt',
                this._onSocketReconnectAttempt,
            )
        } else if (this.socket.connected) {
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
        fallbackWorkerAdapter.port.onmessage({ data: message }),
}

export const fallbackBroadcastChannelAdapter = {
    addEventListener: (
        event: string,
        handler: (event: MessageEvent) => void,
    ) => {
        fallbackBroadcastChannelAdapter.onmessage = handler
    },
    onmessage: _noop,
    postMessage: (message: WSMessage) =>
        fallbackBroadcastChannelAdapter.onmessage({ data: message }),
}
