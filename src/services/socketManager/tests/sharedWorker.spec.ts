import io, {Socket} from 'socket.io-client'

import {
    DISCONNECTED_NOTIFICATION_DELAY,
    HEALTH_CHECK_SEND_INTERVAL,
    HEALTH_CHECK_INTERVAL,
    MAX_INCREMENTAL_RECONNECT_BACKOFF,
    SHARED_WORKER_VERSION,
    SCOPED_BROADCAST_CHANNEL_NAME,
    INTERNAL_SERVER_CONNECTION_ERROR_MESSAGE,
    INCREMENTAL_RECONNECT_BACKOFF,
} from '../constants'
import {
    BroadcastChannelEvent,
    MessagePortEvent,
    SocketEvent,
    WSMessage,
} from '../types'
import IncrementalBackoff from '../incrementalBackoff'
import {WebsocketSharedWorker} from '../sharedWorker'

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
jest.spyOn(global, 'setInterval')
jest.spyOn(global, 'setTimeout')
jest.spyOn(global, 'clearTimeout')

jest.mock('../incrementalBackoff')

class MockMessagePort implements MessagePort {
    postMessage = jest.fn()
    onmessage = null
    onmessageerror = jest.fn()
    close = jest.fn()
    start = jest.fn()
    addEventListener = jest.fn()
    removeEventListener = jest.fn()
    dispatchEvent = jest.fn()
}

const mockDateTimeStamp = 1657187815188

describe('WebsocketSharedWorker', () => {
    let worker: WebsocketSharedWorker

    beforeEach(() => {
        jest.clearAllMocks()
        jest.clearAllTimers()
        worker = new WebsocketSharedWorker()
    })

    describe('instantiation', () => {
        it('should create a new BroadcastChannel with correct name', () => {
            expect(
                (
                    worker.scopedBroadcastChannel as BroadcastChannel & {
                        constructorSpy: jest.Mock
                    }
                ).constructorSpy
            ).toHaveBeenCalledWith(SCOPED_BROADCAST_CHANNEL_NAME)
        })

        it('should create a new IncrementalBackoff with correct delays', () => {
            expect(IncrementalBackoff as jest.Mock).toHaveBeenLastCalledWith({
                initialDelay: INCREMENTAL_RECONNECT_BACKOFF * 1000,
                maxDelay: MAX_INCREMENTAL_RECONNECT_BACKOFF * 1000,
            })
        })
    })

    describe('startHealthCheck()', () => {
        it('should set an interval for sending the health check', () => {
            worker.startHealthCheck()

            expect(setInterval).toHaveBeenCalledWith(
                worker.sendHealthCheck,
                HEALTH_CHECK_SEND_INTERVAL * 1000
            )
        })

        it('should set an interval for disconnecting tabs', () => {
            worker.startHealthCheck()

            expect(setInterval).toHaveBeenCalledWith(
                worker.disconnectTabs,
                HEALTH_CHECK_INTERVAL * 1000
            )
        })
    })

    describe('sendHealthCheck()', () => {
        it('send a `HEALTH_CHECK` message to each connected tab', () => {
            const tab1 = new MockMessagePort()
            const tab2 = new MockMessagePort()

            worker.connectedTabs = {
                clientId1: {
                    messagePort: tab1,
                    lastHealthCheck: mockDateTimeStamp,
                },
                clientId2: {
                    messagePort: tab2,
                    lastHealthCheck: mockDateTimeStamp,
                },
            }

            worker.sendHealthCheck()

            expect(tab1.postMessage).toHaveBeenCalledWith({
                type: MessagePortEvent.HealthCheck,
            })
            expect(tab2.postMessage).toHaveBeenCalledWith({
                type: MessagePortEvent.HealthCheck,
            })
        })
    })

    describe('onHealthCheck()', () => {
        it('should update the tab associated with the passed clientId with a new `lastHealthCheck` timestamp', () => {
            const tab1 = new MockMessagePort()
            const tab2 = new MockMessagePort()

            worker.connectedTabs = {
                clientId1: {
                    messagePort: tab1,
                    lastHealthCheck: mockDateTimeStamp,
                },
                clientId2: {
                    messagePort: tab2,
                    lastHealthCheck: mockDateTimeStamp,
                },
            }

            worker.onHealthCheck('clientId1')

            expect(
                worker.connectedTabs['clientId1'].lastHealthCheck
            ).not.toEqual(mockDateTimeStamp)
        })
    })

    describe('disconnectTabs()', () => {
        it(
            "should send a `CLIENT_DISCONNECTED` message to the worker's socket for each tab in `connectedTabs`" +
                'that has a `lastHealthCheck` older than 5s and delete those tabs from the list of connected tabs',
            () => {
                const tab1 = new MockMessagePort()
                const tab2 = new MockMessagePort()
                const tab3 = new MockMessagePort()

                const mockConnectedTabs = {
                    clientId1: {
                        messagePort: tab1,
                        lastHealthCheck: Date.now() - 6 * 1000,
                    },
                    clientId2: {
                        messagePort: tab2,
                        lastHealthCheck: Date.now() - 7 * 1000,
                    },
                    clientId3: {
                        messagePort: tab3,
                        lastHealthCheck: Date.now() - 1 * 1000,
                    },
                }

                worker.connectedTabs = mockConnectedTabs
                worker.socket = io()

                worker.disconnectTabs()

                expect(worker.connectedTabs).toEqual({
                    clientId3: mockConnectedTabs.clientId3,
                })

                expect(worker.socket.send).toHaveBeenCalledTimes(2)
                expect(worker.socket.send).toHaveBeenCalledWith({
                    event: SocketEvent.ClientDisconnected,
                    clientId: 'clientId1',
                })
                expect(worker.socket.send).toHaveBeenCalledWith({
                    event: SocketEvent.ClientDisconnected,
                    clientId: 'clientId2',
                })
            }
        )
    })

    describe('_onSocketJson()', () => {
        it("should send the message received to the worker's `BroadcastChannel`", () => {
            const message = {foo: 'bar'}

            worker._onSocketJson(message)

            expect(
                worker.scopedBroadcastChannel.postMessage
            ).toHaveBeenCalledWith({
                type: BroadcastChannelEvent.ServerMessage,
                json: message,
            })
        })
    })

    describe('_onSocketConnect()', () => {
        it('should post `WS_CONNECTED` message to the tab', () => {
            worker._onSocketConnect()

            expect(
                worker.scopedBroadcastChannel.postMessage
            ).toHaveBeenCalledWith({
                type: BroadcastChannelEvent.WsConnected,
            })
        })

        it('should clear scheduled "disconnected" notification', () => {
            const sendDisconnectedNotificationTask = setTimeout(jest.fn(), 1000)
            worker.sendDisconnectedNotificationTask =
                sendDisconnectedNotificationTask

            worker._onSocketConnect()

            expect(clearTimeout).toHaveBeenCalledWith(
                sendDisconnectedNotificationTask
            )
            expect(worker.sendDisconnectedNotificationTask).toBe(null)
        })

        it('should clear scheduled reconnect', () => {
            const reset = jest.spyOn(IncrementalBackoff.prototype, 'reset')

            worker._onSocketConnect()

            expect(reset).toBeCalled()
        })
    })

    describe.each([
        {
            name: 'socket disconnect',
            fn: () => worker._onSocketDisconnect('some reason'),
        },
        {
            name: 'socket connect error',
            fn: () => worker._onSocketConnectError(new Error('test error')),
        },
    ])('disconnected notification on $name', ({fn}) => {
        it('should delay a task to send the disconnected notification', () => {
            fn()
            jest.advanceTimersByTime(DISCONNECTED_NOTIFICATION_DELAY * 1000)

            expect(worker.sendDisconnectedNotificationTask).not.toEqual(null)
            expect(
                worker.scopedBroadcastChannel.postMessage
            ).toHaveBeenCalledWith({
                type: BroadcastChannelEvent.WsDisconnected,
            })
        })

        it('should not schedule more than one task', () => {
            fn()
            fn()
            jest.advanceTimersByTime(DISCONNECTED_NOTIFICATION_DELAY * 1000)

            expect(
                worker.scopedBroadcastChannel.postMessage
            ).toHaveBeenCalledTimes(1)
            expect(
                worker.scopedBroadcastChannel.postMessage
            ).toHaveBeenCalledWith({
                type: BroadcastChannelEvent.WsDisconnected,
            })
        })

        it('should schedule a new task to send the disconnected notification after a successful connection', () => {
            fn()
            jest.advanceTimersByTime(DISCONNECTED_NOTIFICATION_DELAY * 1000)
            fn()
            worker._onSocketDisconnect('some reason')
            jest.advanceTimersByTime(DISCONNECTED_NOTIFICATION_DELAY * 1000)

            expect(
                worker.scopedBroadcastChannel.postMessage
            ).toHaveBeenNthCalledWith(1, {
                type: BroadcastChannelEvent.WsDisconnected,
            })
            expect(
                worker.scopedBroadcastChannel.postMessage
            ).toHaveBeenLastCalledWith({
                type: BroadcastChannelEvent.WsDisconnected,
            })
        })
    })

    describe('onSocketConnectError()', () => {
        it('should not schedule reconnect on error', () => {
            const scheduleCall = jest.spyOn(
                IncrementalBackoff.prototype,
                'scheduleCall'
            )

            worker._onSocketConnectError(new Error('Any error'))

            expect(scheduleCall).not.toHaveBeenCalled()
        })

        it('should schedule reconnect on internal server connection error', () => {
            worker.socket = io()
            const scheduleCall = jest.spyOn(
                IncrementalBackoff.prototype,
                'scheduleCall'
            )

            worker._onSocketConnectError(
                new Error(INTERNAL_SERVER_CONNECTION_ERROR_MESSAGE)
            )
            expect(scheduleCall).toHaveBeenCalledTimes(1)

            scheduleCall.mock.calls[0][0](1)
            expect(worker.socket.connect).toHaveBeenCalledTimes(1)
        })
    })

    describe('onClientConnected()', () => {
        it('should setup a socket for the worker because it has no socket', () => {
            const messagePort = new MockMessagePort()
            const message = {clientId: 'my_client_id', wsUrl: 'my_ws_url'}

            expect(worker.wsUrl).toEqual(null)
            expect(worker.socket).toEqual(null)
            expect(worker.connectedTabs).toEqual({})

            worker.onClientConnected(message, messagePort)

            expect(worker.wsUrl).toEqual(message.wsUrl)
            expect(worker.socket).not.toEqual(null)

            expect(worker.socket?.on).toHaveBeenCalledTimes(4)
            expect(worker.socket?.on).toHaveBeenCalledWith(
                'json',
                worker._onSocketJson
            )
            expect(worker.socket?.on).toHaveBeenCalledWith(
                'connect',
                worker._onSocketConnect
            )
            expect(worker.socket?.on).toHaveBeenCalledWith(
                'disconnect',
                worker._onSocketDisconnect
            )
            expect(worker.socket?.on).toHaveBeenCalledWith(
                'connect_error',
                worker._onSocketConnectError
            )

            expect(worker.socket?.io.on).toHaveBeenCalledTimes(1)
            expect(worker.socket?.io.on).toHaveBeenCalledWith(
                'reconnect_attempt',
                worker._onSocketReconnectAttempt
            )

            expect(worker.connectedTabs).toEqual({
                [message.clientId]: {
                    messagePort,
                    lastHealthCheck: expect.any(Number),
                },
            })
            expect(worker.socket?.send).toHaveBeenCalledWith({
                event: SocketEvent.ClientConnected,
                clientId: message.clientId,
            })

            expect(io).toHaveBeenNthCalledWith(
                1,
                message.wsUrl,
                expect.objectContaining({
                    path: '/socket.io/v4/',
                    reconnectionDelay: INCREMENTAL_RECONNECT_BACKOFF * 1000,
                    reconnectionDelayMax:
                        MAX_INCREMENTAL_RECONNECT_BACKOFF * 1000,
                })
            )
        })

        it('should send a `WS_CONNECTED` event on the message port because the worker has a socket', () => {
            const messagePort = new MockMessagePort()
            const message = {clientId: 'my_client_id', wsUrl: 'my_ws_url'}

            worker.socket = {
                connected: true,
                send: jest.fn(),
            } as unknown as Socket

            expect(worker.connectedTabs).toEqual({})

            worker.onClientConnected(message, messagePort)

            expect(messagePort.postMessage).toHaveBeenCalledWith({
                type: BroadcastChannelEvent.WsConnected,
            })
            expect(worker.connectedTabs).toEqual({
                [message.clientId]: {
                    messagePort,
                    lastHealthCheck: expect.any(Number),
                },
            })
            expect(worker.socket.send).toHaveBeenCalledWith({
                event: SocketEvent.ClientConnected,
                clientId: message.clientId,
            })
        })

        it('should NOT send a `WS_CONNECTED` event on the message port if the socket is offline', () => {
            const messagePort = new MockMessagePort()
            const message = {clientId: 'my_client_id', wsUrl: 'my_ws_url'}

            worker.socket = {
                connected: false,
                send: jest.fn(),
            } as unknown as Socket

            worker.onClientConnected(message, messagePort)

            expect(worker.socket.send).toHaveBeenCalledWith({
                event: SocketEvent.ClientConnected,
                clientId: message.clientId,
            })

            expect(messagePort.postMessage).not.toHaveBeenCalledWith({
                type: BroadcastChannelEvent.WsConnected,
            })
        })
    })

    describe('onPortMessage()', () => {
        const messagePort = new MockMessagePort()

        it('should call `onClientConnected` because the type of the message passed is `CLIENT_CONNECTED`', () => {
            const handler = worker.onPortMessage(messagePort)
            const onClientConnectedSpy = jest.spyOn(worker, 'onClientConnected')

            const message = {data: {type: MessagePortEvent.ClientConnected}}

            handler(message as MessageEvent<WSMessage>)

            expect(onClientConnectedSpy).toHaveBeenCalledWith(
                message.data,
                messagePort
            )
        })

        it('should call `onHealthCheck` because the type of the message passed is `HEALTH_CHECK`', () => {
            const handler = worker.onPortMessage(messagePort)
            const onHealthCheckSpy = jest.spyOn(worker, 'onHealthCheck')

            const message = {
                data: {
                    type: MessagePortEvent.HealthCheck,
                    data: {foo: 'bar'},
                },
            }

            handler(message as MessageEvent<WSMessage>)

            expect(onHealthCheckSpy).toHaveBeenCalledWith(message.data.data)
        })

        it(
            "should send the message on the worker's socket because the type of the message is not " +
                '`CLIENT_CONNECTED` or `HEALTH_CHECK` and the worker has a socket',
            () => {
                const handler = worker.onPortMessage(messagePort)
                worker.socket = io()
                const message = {
                    data: {type: 'another type', data: {foo: 'bar'}},
                }

                handler(message as MessageEvent<WSMessage>)

                expect(worker.socket.send).toHaveBeenCalledWith(message.data)
            }
        )

        it('should call `_broadcastVersion` because it received a message of type `GET_VERSION`', () => {
            worker._broadcastVersion = jest.fn()

            const handler = worker.onPortMessage(messagePort)
            worker.socket = io()
            const message = {
                data: {type: MessagePortEvent.GetVersion},
            }

            handler(message as MessageEvent<WSMessage>)

            expect(worker._broadcastVersion).toHaveBeenCalled()
        })
    })

    describe('onPortConnect()', () => {
        it('should set the `onmessage` handler on the port passed in the passed event', () => {
            const messagePort = new MockMessagePort()
            expect(messagePort.onmessage).toEqual(null)

            worker.onPortConnect({
                ports: [messagePort],
            } as unknown as MessageEvent)

            expect(messagePort.onmessage).toEqual(expect.any(Function))
        })
    })

    describe('_broadcastVersion()', () => {
        it('should broadcast its current version', () => {
            worker._broadcastVersion()

            expect(
                worker.scopedBroadcastChannel.postMessage
            ).toHaveBeenCalledWith({
                type: BroadcastChannelEvent.Version,
                data: SHARED_WORKER_VERSION,
            })
        })
    })
})
