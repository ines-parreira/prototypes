import io from 'socket.io-client'

import {
    DISCONNECTED_NOTIFICATION_DELAY,
    HEALTH_CHECK_INTERVAL,
    HEALTH_CHECK_TIMEOUT,
    MAX_INCREMENTAL_RECONNECT_BACKOFF,
    SOCKET_EVENTS,
    WebsocketSharedWorker,
} from '../sharedWorker'
import {BroadcastChannelEvent, MessagePortEvent} from '../types'

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

class MockMessagePort {
    postMessage = jest.fn()
    onmessage = null
}

describe('WebsocketSharedWorker', () => {
    let worker: WebsocketSharedWorker

    beforeEach(() => {
        jest.clearAllMocks()
        jest.clearAllTimers()
        worker = new WebsocketSharedWorker()
    })

    describe('startHealthCheck()', () => {
        it('should set an interval for sending the health check', () => {
            worker.startHealthCheck()

            expect(setInterval).toHaveBeenCalledWith(
                worker.sendHealthCheck,
                HEALTH_CHECK_INTERVAL * 1000
            )
        })
    })

    describe('sendHealthCheck()', () => {
        it(
            'should set all tabs from `connectedTabs` into `pendingTabs`, send a `HEALTH_CHECK` message to each ' +
                'connected tab, and set a timeout for the `disconnectTabs` function',
            () => {
                const tab1 = new MockMessagePort()
                const tab2 = new MockMessagePort()

                worker.connectedTabs = {
                    clientId1: tab1,
                    clientId2: tab2,
                } as any
                expect(worker.pendingTabs).toEqual({})

                worker.sendHealthCheck()

                expect(worker.pendingTabs).toEqual(worker.connectedTabs)
                expect(setTimeout).toHaveBeenCalledWith(
                    worker.disconnectTabs,
                    HEALTH_CHECK_TIMEOUT * 1000
                )
                expect(tab1.postMessage).toHaveBeenCalledWith({
                    type: MessagePortEvent.HealthCheck,
                })
                expect(tab2.postMessage).toHaveBeenCalledWith({
                    type: MessagePortEvent.HealthCheck,
                })
            }
        )
    })

    describe('onHealthCheck()', () => {
        it('should delete the tab associated with the passed clientId from the list of pending tabs', () => {
            const tab1 = new MockMessagePort()
            const tab2 = new MockMessagePort()

            worker.pendingTabs = {clientId1: tab1, clientId2: tab2} as any

            worker.onHealthCheck('clientId1')

            expect(worker.pendingTabs).toEqual({clientId2: tab2})
        })
    })

    describe('disconnectTabs()', () => {
        it(
            "should send a `CLIENT_DISCONNECTED` message to the worker's socket for each tab in `pendingTabs`, " +
                'empty the `pendinTabs` object and delete those tabs from the list of connected tabs',
            () => {
                const tab1 = new MockMessagePort()
                const tab2 = new MockMessagePort()
                const tab3 = new MockMessagePort()

                worker.pendingTabs = {clientId1: tab1, clientId2: tab2} as any
                worker.connectedTabs = {
                    clientId1: tab1,
                    clientId2: tab2,
                    clientId3: tab3,
                } as any
                worker.socket = io()

                worker.disconnectTabs()

                expect(worker.pendingTabs).toEqual({})
                expect(worker.connectedTabs).toEqual({clientId3: tab3})

                expect(worker.socket.send).toHaveBeenCalledTimes(2)
                expect(worker.socket.send).toHaveBeenCalledWith({
                    event: SOCKET_EVENTS.CLIENT_DISCONNECTED,
                    clientId: 'clientId1',
                })
                expect(worker.socket.send).toHaveBeenCalledWith({
                    event: SOCKET_EVENTS.CLIENT_DISCONNECTED,
                    clientId: 'clientId2',
                })
            }
        )
    })

    describe('incrementalReconnect()', () => {
        it(
            "should try to connect the worker's socket, double the reconnect backoff time, " +
                'and then set another timeout to try again later',
            () => {
                worker.socket = io()

                const oldBackoff = worker.incrementalReconnectBackoff

                worker.incrementalReconnect()

                jest.runOnlyPendingTimers()

                expect(worker.socket.connect).toHaveBeenCalledTimes(1)
                expect(worker.incrementalReconnectBackoff).toEqual(
                    2 * oldBackoff
                )

                expect(setTimeout).toHaveBeenLastCalledWith(
                    expect.any(Function),
                    worker.incrementalReconnectBackoff * 1000
                )
            }
        )

        it('should not increase the reconnect backoff time above the max', () => {
            worker.socket = io()

            worker.incrementalReconnectBackoff = MAX_INCREMENTAL_RECONNECT_BACKOFF

            worker.incrementalReconnect()

            jest.runOnlyPendingTimers()

            expect(worker.socket.connect).toHaveBeenCalledTimes(1)
            expect(worker.incrementalReconnectBackoff).toEqual(
                MAX_INCREMENTAL_RECONNECT_BACKOFF
            )

            expect(setTimeout).toHaveBeenLastCalledWith(
                expect.any(Function),
                worker.incrementalReconnectBackoff * 1000
            )
        })
    })

    describe('_onSocketJson()', () => {
        it("should send the message received to the worker's `BroadcastChannel`", () => {
            const message = {foo: 'bar'}

            worker._onSocketJson(message)

            expect(worker.broadcastChannel.postMessage).toHaveBeenCalledWith({
                type: BroadcastChannelEvent.ServerMessage,
                json: message,
            })
        })
    })

    describe('_onSocketConnect()', () => {
        it(
            'should post a `WS_CONNECTED` message to the tab, reset the `incrementalReconnectBackoff` and clear all ' +
                'tasks',
            () => {
                worker.incrementalReconnectTask = window.setTimeout(
                    jest.fn(),
                    1000
                )
                worker.sendDisconnectedNotificationTask = window.setTimeout(
                    jest.fn(),
                    1000
                )
                worker.incrementalReconnectBackoff = MAX_INCREMENTAL_RECONNECT_BACKOFF

                worker._onSocketConnect()

                expect(clearTimeout).toHaveBeenCalledWith(
                    worker.incrementalReconnectTask
                )
                expect(clearTimeout).toHaveBeenCalledWith(
                    worker.sendDisconnectedNotificationTask
                )
                expect(worker.incrementalReconnectBackoff).toEqual(1)
            }
        )
    })

    describe('_onSocketDisconnect()', () => {
        it('should delay a task to send the disconnected notification and try to reconnect', () => {
            const incrementalReconnectSpy = jest.spyOn(
                worker,
                'incrementalReconnect'
            )

            expect(worker.sendDisconnectedNotificationTask).toEqual(null)

            worker._onSocketDisconnect()

            expect(worker.sendDisconnectedNotificationTask).not.toEqual(null)
            expect(setTimeout).toHaveBeenCalledWith(
                expect.any(Function),
                DISCONNECTED_NOTIFICATION_DELAY * 1000
            )

            expect(incrementalReconnectSpy).toHaveBeenCalledTimes(1)
        })
    })

    describe('onClientConnected()', () => {
        it('should setup a socket for the worker because it has no socket', () => {
            const messagePort = (new MockMessagePort() as unknown) as BroadcastChannel
            const message = {clientId: 'my_client_id', wsUrl: 'my_ws_url'}

            expect(worker.wsUrl).toEqual(null)
            expect(worker.socket).toEqual(null)
            expect(worker.connectedTabs).toEqual({})

            worker.onClientConnected(message, messagePort)

            expect(worker.wsUrl).toEqual(message.wsUrl)
            expect(worker.socket).not.toEqual(null)

            expect(worker.socket!.on).toHaveBeenCalledTimes(3)
            expect(worker.socket!.on).toHaveBeenCalledWith(
                'json',
                worker._onSocketJson
            )
            expect(worker.socket!.on).toHaveBeenCalledWith(
                'connect',
                worker._onSocketConnect
            )
            expect(worker.socket!.on).toHaveBeenCalledWith(
                'disconnect',
                worker._onSocketDisconnect
            )

            expect(worker.connectedTabs).toEqual({
                [message.clientId]: messagePort,
            })
            expect(worker.socket!.send).toHaveBeenCalledWith({
                event: SOCKET_EVENTS.CLIENT_CONNECTED,
                clientId: message.clientId,
            })
        })

        it('should send a `WS_CONNECTED` event on the message port because the worker has a socket', () => {
            const messagePort = (new MockMessagePort() as unknown) as BroadcastChannel
            const message = {clientId: 'my_client_id', wsUrl: 'my_ws_url'}

            worker.socket = io()

            expect(worker.connectedTabs).toEqual({})

            worker.onClientConnected(message, messagePort)

            expect(messagePort.postMessage).toHaveBeenCalledWith({
                type: BroadcastChannelEvent.WsConnected,
            })
            expect(worker.connectedTabs).toEqual({
                [message.clientId]: messagePort,
            })
            expect(worker.socket.send).toHaveBeenCalledWith({
                event: SOCKET_EVENTS.CLIENT_CONNECTED,
                clientId: message.clientId,
            })
        })
    })

    describe('onPortMessage()', () => {
        const messagePort = (new MockMessagePort() as unknown) as BroadcastChannel

        it('should call `onClientConnected` because the type of the message passed is `CLIENT_CONNECTED`', () => {
            const handler = worker.onPortMessage(messagePort)
            const onClientConnectedSpy = jest.spyOn(worker, 'onClientConnected')

            const message = {data: {type: MessagePortEvent.ClientConnected}}

            handler(message)

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

            handler(message)

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

                handler(message as any)

                expect(worker.socket.send).toHaveBeenCalledWith(message.data)
            }
        )
    })

    describe('onPortConnect()', () => {
        it('should set the `onmessage` handler on the port passed in the passed event', () => {
            const messagePort = (new MockMessagePort() as unknown) as BroadcastChannel
            expect(messagePort.onmessage).toEqual(null)

            worker.onPortConnect({ports: [messagePort]})

            expect(messagePort.onmessage).toEqual(expect.any(Function))
        })
    })
})
