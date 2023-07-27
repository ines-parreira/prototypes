import _find from 'lodash/find'
import * as reapop from 'reapop'

import * as socketEvents from 'config/socketEvents'
import * as actions from 'state/notifications/actions'

import * as segmentTracker from 'store/middlewares/segmentTracker'
import {BROADCAST_CHANNEL_NAME, SHARED_WORKER_VERSION} from '../constants'
import {
    BroadcastChannelEvent,
    MessagePortEvent,
    JoinEventType,
    SocketEventType,
    ServerMessage,
} from '../types'
import {SocketManager} from '../socketManager'

const logEventSpy = jest.spyOn(segmentTracker, 'logEvent')

describe('SocketManager', () => {
    const socketManager = new SocketManager()
    const onConnectSpy = jest.spyOn(socketManager, 'onConnect')
    const onDisconnectSpy = jest.spyOn(socketManager, 'onDisconnect')
    const onServerMessageSpy = jest.spyOn(socketManager, 'onServerMessage')
    const sendToServerSpy = jest.spyOn(socketManager, '_sendToServer')
    const joinRoomSpy = jest.spyOn(socketManager, '_joinRoom')
    const leaveRoomSpy = jest.spyOn(socketManager, '_leaveRoom')
    const onVersionSpy = jest.spyOn(socketManager, '_onVersion')
    const renderOutdatedBannerSpy = jest.spyOn(
        socketManager,
        '_renderOutdatedBanner'
    )

    const notifySpy = jest.spyOn(actions, 'notify')
    const dismissNotificationSpy = jest.spyOn(reapop, 'dismissNotification')

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
        logEventSpy.mockClear()
    })

    describe('constructor()', () => {
        it('should initialize the socket manager correctly', () => {
            const socketManager = new SocketManager()

            expect(socketManager.worker).toBeInstanceOf(window.SharedWorker)
            expect(socketManager.worker.port.start).toHaveBeenCalledTimes(1)
            expect(socketManager.worker.port.onmessage).not.toEqual(null)
            expect(socketManager.worker.port.postMessage).toHaveBeenCalledWith({
                type: MessagePortEvent.ClientConnected,
                wsUrl: window.WS_URL,
                clientId: window.CLIENT_ID,
            })

            expect(socketManager.broadcastChannel).toBeInstanceOf(
                window.BroadcastChannel
            )
            expect(
                (
                    socketManager.broadcastChannel as BroadcastChannel & {
                        constructorSpy: jest.Mock
                    }
                ).constructorSpy
            ).toHaveBeenCalledWith(BROADCAST_CHANNEL_NAME)
            expect(
                socketManager.broadcastChannel.addEventListener
            ).toHaveBeenCalledTimes(1)

            expect(socketManager._isSharedWorkerUpToDate).toBe(false)
            expect(socketManager.worker.port.postMessage).toHaveBeenCalledWith({
                type: MessagePortEvent.GetVersion,
            })
        })
    })

    describe('onMessage()', () => {
        it('should call `onConnect` when receiving a `WS_CONNECTED` event', () => {
            socketManager.onMessage({
                type: BroadcastChannelEvent.WsConnected,
            })

            expect(onConnectSpy).toHaveBeenCalledTimes(1)
            expect(onDisconnectSpy).not.toHaveBeenCalled()
            expect(onServerMessageSpy).not.toHaveBeenCalled()
        })

        it('should call `onDisconnect` when receiving a `WS_DISCONNECTED` event', () => {
            socketManager.onMessage({
                type: BroadcastChannelEvent.WsDisconnected,
            })

            expect(onConnectSpy).not.toHaveBeenCalled()
            expect(onDisconnectSpy).toHaveBeenCalledTimes(1)
            expect(onServerMessageSpy).not.toHaveBeenCalled()
        })

        it('should call `onServerMessage` when receiving a `SERVER_MESSAGE` event', () => {
            const message = {
                type: BroadcastChannelEvent.ServerMessage,
                json: {foo: 'bar'},
            }

            socketManager.onMessage(message)

            expect(onConnectSpy).not.toHaveBeenCalled()
            expect(onDisconnectSpy).not.toHaveBeenCalled()
            expect(onServerMessageSpy).toHaveBeenCalledTimes(1)
            expect(onServerMessageSpy).toHaveBeenCalledWith(message.json)
        })

        it('should call `_onVersion` when receiving a `VERSION` event', () => {
            const message = {
                type: BroadcastChannelEvent.Version,
                data: SHARED_WORKER_VERSION,
            }

            socketManager.onMessage(message)

            expect(onVersionSpy).toHaveBeenCalledWith(SHARED_WORKER_VERSION)
        })
    })

    describe('onServerMessage()', () => {
        it.each([null, {}, {foo: 'bar'}, {event: {foo: 'bar'}}])(
            'should not do anything and not throw an error when passed message is missing some fields',
            (serverMessage) => {
                socketManager.onServerMessage(
                    serverMessage as Maybe<ServerMessage>
                )
            }
        )

        it('should call `onReceive` of matching configuration', () => {
            const eventType = 'customer-updated'
            const serverMessage = {event: {type: eventType}}

            const config = _find(socketEvents.receivedEvents, {name: eventType})
            config!.onReceive.call = jest.fn()

            socketManager.onServerMessage(serverMessage as Maybe<ServerMessage>)

            expect(config!.onReceive.call).toHaveBeenCalledWith(
                socketManager,
                serverMessage
            )
        })
    })

    describe('onDisconnect()', () => {
        it("should update the manager's `isConnected` status and dispatch the websocket notification", () => {
            socketManager.isConnected = true

            socketManager.onDisconnect()

            expect(socketManager.isConnected).toEqual(false)
            expect(notifySpy.mock.calls).toMatchSnapshot()
        })
    })

    describe('onConnect()', () => {
        it("should update the manager's `isConnected` status and remove the websocket notification", () => {
            socketManager.isConnected = false

            socketManager.onConnect()

            expect(socketManager.isConnected).toEqual(true)
            expect(dismissNotificationSpy.mock.calls).toMatchSnapshot()
        })
    })

    describe('send()', () => {
        it('should call `_sendDataToServer` using the data formatted using the config matching passed `configName`', () => {
            const configName = SocketEventType.TicketViewed
            const config = _find(socketEvents.sendEvents, {name: configName})
            const id = '1'

            socketManager.send(configName, id)

            expect(sendToServerSpy).toHaveBeenCalledWith(config!.dataToSend(id))
        })
    })

    describe('join()', () => {
        it('should call `_sendDataToServer` using the data formatted using the config matching passed `configName`', () => {
            const configName = JoinEventType.Ticket
            const config = _find(socketEvents.joinEvents, {name: configName})
            const id = '1'

            socketManager.join(configName, id)

            expect(joinRoomSpy).toHaveBeenCalledWith(config!.dataToSend(id))
        })
    })

    describe('leave()', () => {
        it('should call `_sendDataToServer` using the data formatted using the config matching passed `configName`', () => {
            const configName = JoinEventType.Ticket
            const config = _find(socketEvents.joinEvents, {name: configName})
            const id = '1'

            socketManager.leave(configName, id)

            expect(leaveRoomSpy).toHaveBeenCalledTimes(1)
            expect(leaveRoomSpy.mock.calls[0][0]).toEqual(
                config!.dataToSend(id)
            )
        })
    })

    describe('_checkVersion()', () => {
        it('should render the banner because the shared worker is outdated', () => {
            socketManager._checkVersion()
            expect(socketManager.worker.port.postMessage).toHaveBeenCalledWith({
                type: MessagePortEvent.GetVersion,
            })

            socketManager._isSharedWorkerUpToDate = false
            jest.runOnlyPendingTimers()
            expect(renderOutdatedBannerSpy).toHaveBeenCalled()
        })

        it('should not render the banner because the shared worker is up-to-date', () => {
            socketManager._checkVersion()
            expect(socketManager.worker.port.postMessage).toHaveBeenCalledWith({
                type: MessagePortEvent.GetVersion,
            })

            socketManager._isSharedWorkerUpToDate = true
            jest.runOnlyPendingTimers()
            expect(renderOutdatedBannerSpy).not.toHaveBeenCalled()
        })
    })

    describe('_onVersion()', () => {
        it('should update the "up-to-date" status of the shared worker', () => {
            const socketManager = new SocketManager()
            expect(socketManager._isSharedWorkerUpToDate).toBe(false)

            socketManager._onVersion(SHARED_WORKER_VERSION)
            expect(socketManager._isSharedWorkerUpToDate).toBe(true)

            socketManager._onVersion(1)
            expect(socketManager._isSharedWorkerUpToDate).toBe(false)
        })
    })

    describe('_renderOutdatedBanner()', () => {
        it('should render the "outdated" banner', () => {
            socketManager._renderOutdatedBanner()
            expect(notifySpy.mock.calls).toMatchSnapshot()
            expect(logEventSpy).toHaveBeenLastCalledWith(
                segmentTracker.SegmentEvent.OutdatedSharedWorkerDetected
            )
        })
    })
})
