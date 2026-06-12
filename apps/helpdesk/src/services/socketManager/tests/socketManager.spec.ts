import * as segment from '@repo/logging'
import _noop from 'lodash/noop'
import * as reapop from 'reapop'

import * as actions from 'state/notifications/actions'
import type { BannerNotification } from 'state/notifications/types'

import {
    RELOAD_TAB_DELAY,
    SCOPED_BROADCAST_CHANNEL_NAME,
    SHARED_WORKER_NAME,
} from '../constants'
import { SocketManager } from '../socketManager'
import type { ReceivedEvent, SendEvent, ServerMessage } from '../types'
import {
    BroadcastChannelEvent,
    JoinEventType,
    MessagePortEvent,
    SocketEventType,
} from '../types'

jest.unmock('services/socketManager')
jest.unmock('services/socketManager/socketManager')

const logEventSpy = jest.spyOn(segment, 'logEvent')

describe('SocketManager', () => {
    const socketManager = new SocketManager()
    const onConnectSpy = jest.spyOn(socketManager, 'onConnect')
    const onDisconnectSpy = jest.spyOn(socketManager, 'onDisconnect')
    const onReloadSpy = jest.spyOn(socketManager, 'onReload')
    const onServerMessageSpy = jest.spyOn(socketManager, 'onServerMessage')
    const sendToServerSpy = jest.spyOn(socketManager, '_sendToServer')
    const joinRoomSpy = jest.spyOn(socketManager, '_joinRoom')
    const leaveRoomSpy = jest.spyOn(socketManager, '_leaveRoom')
    const resetWorker = jest.spyOn(socketManager, 'resetWorker')

    const notifySpy = jest.spyOn(actions, 'notify')
    const dismissNotificationSpy = jest.spyOn(reapop, 'dismissNotification')

    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
        logEventSpy.mockClear()
    })

    describe('constructor()', () => {
        it('should initialize the socket manager correctly', () => {
            const socketManager = new SocketManager()

            expect(
                (
                    socketManager.worker as SharedWorker & {
                        constructorSpy: jest.Mock
                    }
                ).constructorSpy,
            ).toHaveBeenCalledWith(
                window.SHARED_WORKER_BUILD_URL,
                SHARED_WORKER_NAME,
            )

            expect(socketManager.worker).toBeInstanceOf(window.SharedWorker)
            expect(socketManager.worker.port.onmessage).not.toEqual(null)
            expect(socketManager.worker.port.postMessage).toHaveBeenCalledWith({
                type: MessagePortEvent.ClientConnected,
                wsUrl: window.WS_URL,
                clientId: window.CLIENT_ID,
            })

            expect(socketManager.scopedBroadcastChannel).toBeInstanceOf(
                window.BroadcastChannel,
            )
            expect(
                (
                    socketManager.scopedBroadcastChannel as BroadcastChannel & {
                        constructorSpy: jest.Mock
                    }
                ).constructorSpy,
            ).toHaveBeenCalledWith(SCOPED_BROADCAST_CHANNEL_NAME)
            expect(
                socketManager.scopedBroadcastChannel.addEventListener,
            ).toHaveBeenCalledTimes(1)
        })
    })

    describe('onMessage()', () => {
        it('should call `onConnect` when receiving a `WS_CONNECTED` event', () => {
            socketManager.onMessage({
                type: BroadcastChannelEvent.WsConnected,
            })

            expect(onConnectSpy).toHaveBeenCalledTimes(1)
            expect(onDisconnectSpy).not.toHaveBeenCalled()
            expect(onReloadSpy).not.toHaveBeenCalled()
            expect(onServerMessageSpy).not.toHaveBeenCalled()
        })

        it('should call `onDisconnect` when receiving a `WS_DISCONNECTED` event', () => {
            socketManager.onMessage({
                type: BroadcastChannelEvent.WsDisconnected,
            })

            expect(onConnectSpy).not.toHaveBeenCalled()
            expect(onDisconnectSpy).toHaveBeenCalledTimes(1)
            expect(onReloadSpy).not.toHaveBeenCalled()
            expect(onServerMessageSpy).not.toHaveBeenCalled()
        })

        it('should call `onReload` when receiving a `RELOAD_ALL_TABS` event', () => {
            socketManager.onMessage({
                type: BroadcastChannelEvent.ReloadAllTabs,
            })

            expect(onConnectSpy).not.toHaveBeenCalled()
            expect(onDisconnectSpy).not.toHaveBeenCalled()
            expect(onReloadSpy).toHaveBeenCalledTimes(1)
            expect(onServerMessageSpy).not.toHaveBeenCalled()
        })

        it('should call `onServerMessage` when receiving a `SERVER_MESSAGE` event', () => {
            const message = {
                type: BroadcastChannelEvent.ServerMessage,
                json: { foo: 'bar' },
            }

            socketManager.onMessage(message)

            expect(onConnectSpy).not.toHaveBeenCalled()
            expect(onDisconnectSpy).not.toHaveBeenCalled()
            expect(onReloadSpy).not.toHaveBeenCalled()
            expect(onServerMessageSpy).toHaveBeenCalledTimes(1)
            expect(onServerMessageSpy).toHaveBeenCalledWith(message.json)
        })
    })

    describe('onServerMessage()', () => {
        it.each([null, {}, { foo: 'bar' }, { event: { foo: 'bar' } }])(
            'should not do anything and not throw an error when passed message is missing some fields',
            (serverMessage) => {
                socketManager.onServerMessage(
                    serverMessage as Maybe<ServerMessage>,
                )
            },
        )

        it('should call `onReceive` of matching configuration', () => {
            const event: ReceivedEvent = {
                name: 'customer-updated',
                onReceive: _noop,
            }

            socketManager.registerReceivedEvents([event])

            const eventType = 'customer-updated'
            const serverMessage = { event: { type: eventType } }

            event.onReceive.call = jest.fn()

            socketManager.onServerMessage(serverMessage as Maybe<ServerMessage>)

            expect(event.onReceive.call).toHaveBeenCalledWith(
                socketManager,
                serverMessage,
            )
        })
    })

    describe('onDisconnect()', () => {
        it("should update the manager's `isConnected` status and dispatch the websocket notification", () => {
            socketManager.isConnected = true

            socketManager.onDisconnect()

            expect(socketManager.isConnected).toEqual(false)
            expect(notifySpy.mock.calls).toMatchSnapshot()
            expect(resetWorker).toHaveBeenCalledTimes(0)
            ;(notifySpy.mock.calls[0][0] as BannerNotification).CTA?.onClick?.()
            expect(resetWorker).toHaveBeenCalledTimes(1)
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
            const event: SendEvent = {
                name: SocketEventType.TicketViewed,
                dataToSend: function (id) {
                    return {
                        clientId: window.CLIENT_ID,
                        event: SocketEventType.TicketViewed,
                        dataType: 'Ticket',
                        data: parseInt(id as string),
                    }
                },
            }

            socketManager.registerSendEvents([event])

            const id = '1'
            socketManager.send(SocketEventType.TicketViewed, id)
            expect(sendToServerSpy).toHaveBeenCalledWith(event.dataToSend(id))
        })
    })

    describe('join()', () => {
        it('should call `_sendDataToServer` using the data formatted using the config matching passed `configName`', () => {
            const event: SendEvent = {
                name: JoinEventType.Ticket,
                dataToSend: function (id) {
                    return {
                        clientId: window.CLIENT_ID,
                        dataType: 'Ticket',
                        data: parseInt(id as string),
                    }
                },
            }

            socketManager.registerJoinEvents([event])

            const id = '1'
            socketManager.join(JoinEventType.Ticket, id)
            expect(joinRoomSpy).toHaveBeenCalledWith(event.dataToSend(id))
        })
    })

    describe('leave()', () => {
        it('should call `_sendDataToServer` using the data formatted using the config matching passed `configName`', () => {
            const event: SendEvent = {
                name: JoinEventType.Ticket,
                dataToSend: function (id) {
                    return {
                        clientId: window.CLIENT_ID,
                        dataType: 'Ticket',
                        data: parseInt(id as string),
                    }
                },
            }

            socketManager.registerJoinEvents([event])

            const id = '1'
            socketManager.leave(JoinEventType.Ticket, id)
            expect(leaveRoomSpy).toHaveBeenCalledTimes(1)
            expect(leaveRoomSpy.mock.calls[0][0]).toEqual(event.dataToSend(id))
        })
    })

    describe('onReload()', () => {
        it('should call `location.reload`', () => {
            socketManager.onReload()
            expect(window.location.reload).toHaveBeenCalledTimes(1)
        })
    })

    describe('resetWorker()', () => {
        it('should call onReload and send reload signal after exhausting timeout', () => {
            socketManager.resetWorker()
            jest.advanceTimersByTime(RELOAD_TAB_DELAY * 1000)
            expect(onReloadSpy).toHaveBeenCalledTimes(1)
            expect(
                socketManager.scopedBroadcastChannel.postMessage,
            ).toHaveBeenNthCalledWith(1, {
                type: BroadcastChannelEvent.ReloadAllTabs,
            })
        })
        it('should send a terminate worker signal', () => {
            socketManager.resetWorker()
            expect(socketManager.worker.port.postMessage).toHaveBeenCalledWith({
                type: MessagePortEvent.TerminateWorker,
            })
        })
    })
})
