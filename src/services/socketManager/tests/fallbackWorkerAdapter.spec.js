import io from 'socket.io-client'

import {BROADCAST_CHANNEL_EVENTS} from '../constants'
import {
    FallbackWorker,
    fallbackWorkerAdapter,
    MAX_INCREMENTAL_RECONNECT_BACKOFF,
    DISCONNECTED_NOTIFICATION_DELAY,
} from '../fallbackWorkerAdapter'

jest.mock('socket.io-client', () => {
    return () => {
        return {
            connect: jest.fn(),
            send: jest.fn(),
            on: jest.fn(),
        }
    }
})

jest.useFakeTimers()

describe('FallbackWorker', () => {
    let fallbackWorker

    const spyFallbackWorker = {
        port: {
            start: jest.spyOn(fallbackWorkerAdapter.port, 'start'),
            postMessage: jest.spyOn(fallbackWorkerAdapter.port, 'postMessage'),
            onmessage: jest.spyOn(fallbackWorkerAdapter.port, 'onmessage'),
        },
        postMessage: jest.spyOn(fallbackWorkerAdapter, 'postMessage'),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        fallbackWorker = new FallbackWorker()
    })

    describe('incrementalReconnect()', () => {
        it(
            "should try to connect the worker's socket, double the reconnect backoff time, " +
                'and then set another timeout to try again later',
            () => {
                fallbackWorker.onConnect()

                const oldBackoff = fallbackWorker.incrementalReconnectBackoff

                fallbackWorker.incrementalReconnect()

                jest.runOnlyPendingTimers()

                expect(fallbackWorker.socket.connect).toHaveBeenCalledTimes(1)
                expect(fallbackWorker.incrementalReconnectBackoff).toEqual(
                    2 * oldBackoff
                )

                expect(setTimeout).toHaveBeenLastCalledWith(
                    expect.any(Function),
                    fallbackWorker.incrementalReconnectBackoff * 1000
                )
            }
        )

        it('should not increase the reconnect backoff time above the max', () => {
            fallbackWorker.onConnect()

            fallbackWorker.incrementalReconnectBackoff =
                MAX_INCREMENTAL_RECONNECT_BACKOFF

            fallbackWorker.incrementalReconnect()

            jest.runOnlyPendingTimers()

            expect(fallbackWorker.socket.connect).toHaveBeenCalledTimes(1)
            expect(fallbackWorker.incrementalReconnectBackoff).toEqual(
                MAX_INCREMENTAL_RECONNECT_BACKOFF
            )

            expect(setTimeout).toHaveBeenLastCalledWith(
                expect.any(Function),
                fallbackWorker.incrementalReconnectBackoff * 1000
            )
        })
    })

    describe('_onSocketJson', () => {
        it('should post the message to the tab', () => {
            const message = {foo: 'bar'}

            fallbackWorker._onSocketJson(message)

            expect(spyFallbackWorker.postMessage).toHaveBeenCalledWith({
                type: BROADCAST_CHANNEL_EVENTS.SERVER_MESSAGE,
                json: message,
            })
        })
    })

    describe('_onSocketConnect', () => {
        it(
            'should post a `WS_CONNECTED` message to the tab, reset the `incrementalReconnectBackoff` and clear all ' +
                'tasks',
            () => {
                fallbackWorker.incrementalReconnectTask = setTimeout(
                    jest.fn(),
                    1000
                )
                fallbackWorker.sendDisconnectedNotificationTask = setTimeout(
                    jest.fn(),
                    1000
                )
                fallbackWorker.incrementalReconnectBackoff =
                    MAX_INCREMENTAL_RECONNECT_BACKOFF

                fallbackWorker._onSocketConnect()

                expect(clearTimeout).toHaveBeenCalledWith(
                    fallbackWorker.incrementalReconnectTask
                )
                expect(clearTimeout).toHaveBeenCalledWith(
                    fallbackWorker.sendDisconnectedNotificationTask
                )
                expect(fallbackWorker.incrementalReconnectBackoff).toEqual(1)
            }
        )
    })

    describe('_onSocketDisconnect', () => {
        it('should delay a task to send the disconnected notification and try to reconnect', () => {
            const incrementalReconnectSpy = jest.spyOn(
                fallbackWorker,
                'incrementalReconnect'
            )

            expect(fallbackWorker.sendDisconnectedNotificationTask).toEqual(
                null
            )

            fallbackWorker._onSocketDisconnect()

            expect(fallbackWorker.sendDisconnectedNotificationTask).not.toEqual(
                null
            )
            expect(setTimeout).toHaveBeenCalledWith(
                expect.any(Function),
                DISCONNECTED_NOTIFICATION_DELAY * 1000
            )

            expect(incrementalReconnectSpy).toHaveBeenCalledTimes(1)
        })
    })

    describe('onConnect()', () => {
        it('should create a new socket because the worker does not have a socket yet', () => {
            expect(fallbackWorker.socket).toEqual(null)

            fallbackWorker.onConnect()

            expect(fallbackWorker.socket).not.toEqual(null)
            expect(fallbackWorker.socket.on).toHaveBeenCalledTimes(3)
            expect(fallbackWorker.socket.on).toHaveBeenCalledWith(
                'json',
                fallbackWorker._onSocketJson
            )
            expect(fallbackWorker.socket.on).toHaveBeenCalledWith(
                'connect',
                fallbackWorker._onSocketConnect
            )
            expect(fallbackWorker.socket.on).toHaveBeenCalledWith(
                'disconnect',
                fallbackWorker._onSocketDisconnect
            )
        })

        it('should post a `WS_CONNECTED` message to the tab because the worker already have a socket', () => {
            fallbackWorker.socket = io()

            fallbackWorker.onConnect()

            expect(spyFallbackWorker.postMessage).toHaveBeenCalledWith({
                type: BROADCAST_CHANNEL_EVENTS.WS_CONNECTED,
            })
        })
    })

    describe('onMessage()', () => {
        it('should send a message to the socket because it is defined', () => {
            fallbackWorker.socket = {send: jest.fn()}
            const message = {foo: 'bar'}

            fallbackWorker.onMessage(message)

            expect(fallbackWorker.socket.send).toHaveBeenCalledWith(message)
        })
    })
})
