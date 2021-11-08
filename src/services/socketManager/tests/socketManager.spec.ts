import _find from 'lodash/find'
import {removeNotification} from 'reapop'

import * as socketEvents from '../../../config/socketEvents'
import {notify} from '../../../state/notifications/actions'
import {BROADCAST_CHANNEL_NAME} from '../constants'
import {SocketManager} from '../socketManager'
import {
    BroadcastChannelEvent,
    JoinEventType,
    MessagePortEvent,
    ServerMessage,
    SocketEventType,
} from '../types'

jest.mock('../../../state/notifications/actions', () => {
    return {
        notify: jest.fn(),
    }
})

jest.mock('reapop', () => {
    const reapop: Record<string, unknown> = jest.requireActual('reapop')

    return {
        ...reapop,
        removeNotification: jest.fn(reapop.removeNotification as any),
    }
})

describe('SocketManager', () => {
    const socketManager = new SocketManager()
    const onConnectSpy = jest.spyOn(socketManager, 'onConnect')
    const onDisconnectSpy = jest.spyOn(socketManager, 'onDisconnect')
    const onServerMessageSpy = jest.spyOn(socketManager, 'onServerMessage')
    const sendToServerSpy = jest.spyOn(socketManager, '_sendToServer')
    const joinRoomSpy = jest.spyOn(socketManager, '_joinRoom')
    const leaveRoomSpy = jest.spyOn(socketManager, '_leaveRoom')

    beforeEach(() => {
        jest.clearAllMocks()
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
                ((socketManager.broadcastChannel as unknown) as Record<
                    string,
                    unknown
                >).constructorSpy
            ).toHaveBeenCalledWith(BROADCAST_CHANNEL_NAME)
            expect(
                socketManager.broadcastChannel.addEventListener
            ).toHaveBeenCalledTimes(1)
        })
    })

    describe('onMessage()', () => {
        it('should call `onConnect` when receiving a `WS_CONNECTED` event', () => {
            socketManager.onMessage({
                type: BroadcastChannelEvent.WsConnected,
                json: null,
            })

            expect(onConnectSpy).toHaveBeenCalledTimes(1)
            expect(onDisconnectSpy).not.toHaveBeenCalled()
            expect(onServerMessageSpy).not.toHaveBeenCalled()
        })

        it('should call `onDisconnect` when receiving a `WS_DISCONNECTED` event', () => {
            socketManager.onMessage({
                type: BroadcastChannelEvent.WsDisconnected,
                json: null,
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

            socketManager.onMessage(message as any)

            expect(onConnectSpy).not.toHaveBeenCalled()
            expect(onDisconnectSpy).not.toHaveBeenCalled()
            expect(onServerMessageSpy).toHaveBeenCalledTimes(1)
            expect(onServerMessageSpy).toHaveBeenCalledWith(message.json)
        })
    })

    describe('onServerMessage()', () => {
        it.each([null, {}, {foo: 'bar'}, {event: {foo: 'bar'}}])(
            'should not do anything and not throw an error when passed message is missing some fields',
            (serverMessage: any) => {
                socketManager.onServerMessage(serverMessage)
            }
        )

        it('should call `onReceive` of matching configuration', () => {
            const eventType = 'customer-updated'
            const serverMessage = {event: {type: eventType}} as ServerMessage

            const config = _find(socketEvents.receivedEvents, {name: eventType})
            config!.onReceive.call = jest.fn()

            socketManager.onServerMessage(serverMessage)

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
            expect(
                (notify as jest.MockedFunction<typeof notify>).mock.calls
            ).toMatchSnapshot()
        })
    })

    describe('onConnect()', () => {
        it("should update the manager's `isConnected` status and remove the websocket notification", () => {
            socketManager.isConnected = false

            socketManager.onConnect()

            expect(socketManager.isConnected).toEqual(true)
            expect(
                (removeNotification as jest.MockedFunction<() => void>).mock
                    .calls
            ).toMatchSnapshot()
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
})
