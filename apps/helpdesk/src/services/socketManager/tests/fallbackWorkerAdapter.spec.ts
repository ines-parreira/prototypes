import type { Socket } from 'socket.io-client'
import io from 'socket.io-client'

import {
    DISCONNECTED_NOTIFICATION_DELAY,
    INCREMENTAL_RECONNECT_BACKOFF,
    INTERNAL_SERVER_CONNECTION_ERROR_MESSAGE,
    MAX_INCREMENTAL_RECONNECT_BACKOFF,
} from '../constants'
import { FallbackWorker, fallbackWorkerAdapter } from '../fallbackWorkerAdapter'
import IncrementalBackoff from '../incrementalBackoff'
import type { WSMessage } from '../types'
import { BroadcastChannelEvent } from '../types'

jest.mock('socket.io-client', () => {
    return jest.fn(() => {
        return {
            connect: jest.fn(),
            send: jest.fn(),
            on: jest.fn(),
            io: {
                on: jest.fn(),
            },
        }
    })
})

jest.useFakeTimers()
jest.spyOn(global, 'setTimeout')
jest.spyOn(global, 'clearTimeout')

jest.mock('../incrementalBackoff')

describe('FallbackWorker', () => {
    let fallbackWorker: FallbackWorker

    const spyFallbackWorker = {
        port: {
            start: jest.spyOn(fallbackWorkerAdapter.port, 'start'),
            postMessage: jest.spyOn(fallbackWorkerAdapter.port, 'postMessage'),
            onmessage: jest.spyOn(fallbackWorkerAdapter.port, 'onmessage'),
        },
        postMessage: jest.spyOn(fallbackWorkerAdapter, 'postMessage'),
    }

    beforeEach(() => {
        fallbackWorker = new FallbackWorker()
    })

    describe('_onSocketJson', () => {
        it('should post the message to the tab', () => {
            const message = { foo: 'bar' }

            fallbackWorker._onSocketJson(message)

            expect(spyFallbackWorker.postMessage).toHaveBeenCalledWith({
                type: BroadcastChannelEvent.ServerMessage,
                json: message,
            })
        })
    })

    describe('_onSocketConnect', () => {
        it('should post `WS_CONNECTED` message to the tab', () => {
            fallbackWorker._onSocketConnect()

            expect(spyFallbackWorker.postMessage).toHaveBeenCalledWith({
                type: BroadcastChannelEvent.WsConnected,
            })
        })

        it('should clear scheduled "disconnected" notification', () => {
            const sendDisconnectedNotificationTask = setTimeout(jest.fn(), 1000)
            fallbackWorker.sendDisconnectedNotificationTask =
                sendDisconnectedNotificationTask as unknown as NodeJS.Timeout

            fallbackWorker._onSocketConnect()

            expect(clearTimeout).toHaveBeenCalledWith(
                sendDisconnectedNotificationTask,
            )
            expect(fallbackWorker.sendDisconnectedNotificationTask).toBe(null)
        })

        it('should clear scheduled reconnect', () => {
            const reset = jest.spyOn(IncrementalBackoff.prototype, 'reset')

            fallbackWorker._onSocketConnect()

            expect(reset).toBeCalled()
        })
    })

    describe.each([
        {
            name: 'socket disconnect',
            fn: () => fallbackWorker._onSocketDisconnect('some reason'),
        },
        {
            name: 'socket connect error',
            fn: () =>
                fallbackWorker._onSocketConnectError(new Error('test error')),
        },
    ])('disconnected notification on $name', ({ fn }) => {
        it('should delay a task to send the disconnected notification', () => {
            fn()
            jest.advanceTimersByTime(DISCONNECTED_NOTIFICATION_DELAY * 1000)

            expect(fallbackWorker.sendDisconnectedNotificationTask).not.toEqual(
                null,
            )
            expect(spyFallbackWorker.postMessage).toHaveBeenCalledWith({
                type: BroadcastChannelEvent.WsDisconnected,
            })
        })

        it('should not schedule more than one task', () => {
            fn()
            fn()
            jest.advanceTimersByTime(DISCONNECTED_NOTIFICATION_DELAY * 1000)

            expect(spyFallbackWorker.postMessage).toHaveBeenCalledTimes(1)
            expect(spyFallbackWorker.postMessage).toHaveBeenCalledWith({
                type: BroadcastChannelEvent.WsDisconnected,
            })
        })

        it('should schedule a new task to send the disconnected notification after a successful connection', () => {
            fn()
            jest.advanceTimersByTime(DISCONNECTED_NOTIFICATION_DELAY * 1000)
            fn()
            fallbackWorker._onSocketDisconnect('some reason')
            jest.advanceTimersByTime(DISCONNECTED_NOTIFICATION_DELAY * 1000)

            expect(spyFallbackWorker.postMessage).toHaveBeenNthCalledWith(1, {
                type: BroadcastChannelEvent.WsDisconnected,
            })
            expect(spyFallbackWorker.postMessage).toHaveBeenLastCalledWith({
                type: BroadcastChannelEvent.WsDisconnected,
            })
        })
    })

    describe('onSocketConnectError()', () => {
        it('should not schedule reconnect on error', () => {
            const scheduleCall = jest.spyOn(
                IncrementalBackoff.prototype,
                'scheduleCall',
            )

            fallbackWorker._onSocketConnectError(new Error('Any error'))

            expect(scheduleCall).not.toHaveBeenCalled()
        })

        it('should schedule reconnect on internal server connection error', () => {
            fallbackWorker.socket = io()
            const scheduleCall = jest.spyOn(
                IncrementalBackoff.prototype,
                'scheduleCall',
            )

            fallbackWorker._onSocketConnectError(
                new Error(INTERNAL_SERVER_CONNECTION_ERROR_MESSAGE),
            )
            expect(scheduleCall).toHaveBeenCalledTimes(1)

            scheduleCall.mock.calls[0][0](1)
            expect(fallbackWorker.socket.connect).toHaveBeenCalledTimes(1)
        })
    })

    describe('onConnect()', () => {
        it('should create a new socket because the worker does not have a socket yet', () => {
            expect(fallbackWorker.socket).toEqual(null)

            fallbackWorker.onConnect()

            expect(fallbackWorker.socket).not.toEqual(null)
            expect(fallbackWorker.socket?.on).toHaveBeenCalledTimes(4)
            expect(fallbackWorker.socket?.on).toHaveBeenCalledWith(
                'json',
                fallbackWorker._onSocketJson,
            )
            expect(fallbackWorker.socket?.on).toHaveBeenCalledWith(
                'connect',
                fallbackWorker._onSocketConnect,
            )
            expect(fallbackWorker.socket?.on).toHaveBeenCalledWith(
                'disconnect',
                fallbackWorker._onSocketDisconnect,
            )
            expect(fallbackWorker.socket?.io.on).toHaveBeenCalledTimes(1)
            expect(fallbackWorker.socket?.io.on).toHaveBeenCalledWith(
                'reconnect_attempt',
                fallbackWorker._onSocketReconnectAttempt,
            )
            expect(io).toHaveBeenNthCalledWith(
                1,
                window.WS_URL,
                expect.objectContaining({
                    path: '/socket.io/v4/',
                    reconnectionDelay: INCREMENTAL_RECONNECT_BACKOFF * 1000,
                    reconnectionDelayMax:
                        MAX_INCREMENTAL_RECONNECT_BACKOFF * 1000,
                }),
            )
        })

        it('should post a `WS_CONNECTED` message to the tab because the worker already have a socket', () => {
            fallbackWorker.socket = {
                connected: true,
                send: jest.fn(),
            } as unknown as Socket

            fallbackWorker.onConnect()

            expect(spyFallbackWorker.postMessage).toHaveBeenCalledWith({
                type: BroadcastChannelEvent.WsConnected,
            })
        })

        it('should NOT send a `WS_CONNECTED` event on the message port if the socket is offline', () => {
            fallbackWorker.socket = {
                connected: false,
                send: jest.fn(),
            } as unknown as Socket

            fallbackWorker.onConnect()

            expect(spyFallbackWorker.postMessage).not.toHaveBeenCalledWith({
                type: BroadcastChannelEvent.WsConnected,
            })
        })
    })

    describe('onMessage()', () => {
        it('should send a message to the socket because it is defined', () => {
            fallbackWorker.socket = { send: jest.fn() } as unknown as Socket
            const message = { foo: 'bar' }

            fallbackWorker.onMessage(message as WSMessage)

            expect(fallbackWorker.socket?.send).toHaveBeenCalledWith(message)
        })
    })
})
