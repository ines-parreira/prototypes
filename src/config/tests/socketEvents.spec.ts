import {fromJS} from 'immutable'
import _find from 'lodash/find'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import {EnhancedStore} from '@reduxjs/toolkit'

import {TicketStatuses} from '../../business/ticket'
import {shouldTicketBeDisplayedInRecentChats} from '../../business/recentChats'

import * as chatActions from '../../state/chats/actions'
import * as currentAccountConstants from '../../state/currentAccount/constants.js'
import * as currentAccountSelectors from '../../state/currentAccount/selectors'
import * as integrationActions from '../../state/integrations/actions'
import * as notificationActions from '../../state/notifications/actions'
import {SocketEventType} from '../../services/socketManager/types'
import * as socketEvents from '../socketEvents'

import {isCurrentlyOnTicket} from '../../utils'
import {store as reduxStore} from '../../init.js'

//$TsFixMe remove once init.js is migrated
const typeSafeReduxStore = reduxStore as EnhancedStore

jest.mock('../../state/chats/actions', () => {
    //eslint-disable-next-line @typescript-eslint/no-var-requires
    const _identity: <T>(v: T) => T = require('lodash/identity')

    return {
        addChat: jest.fn(() => _identity),
        removeChat: jest.fn(() => _identity),
        fetchChatsThrottled: jest.fn(() => _identity),
    }
})

jest.mock('../../init.js', () => {
    /* eslint-disable @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-member-access */
    const {fromJS}: {fromJS: (value: any) => any} = require('immutable')
    const {MAX_RECENT_CHATS} = require('../recentChats')
    const configureMockStore: (
        t: any
    ) => (y: any) => {dispatch: any} = require('redux-mock-store').default
    const thunk = require('redux-thunk').default
    /* eslint-enable */

    const mockStore = configureMockStore([thunk])
    const store = mockStore({
        currentUser: fromJS({id: 1}),
        chats: fromJS({
            tickets: Array(MAX_RECENT_CHATS - 1).fill({
                id: 0,
            }),
        }),
    })

    store.dispatch = jest.fn()

    return {store}
})

jest.mock('../../state/currentAccount/selectors', () => {
    return {
        ...require.requireActual('../../state/currentAccount/selectors'),
        getTicketAssignmentSettings: jest.fn(),
    } as Record<string, unknown>
})

jest.mock('../../business/recentChats', () => {
    return {
        ...require.requireActual('../../business/recentChats.ts'),
        shouldTicketBeDisplayedInRecentChats: jest.fn(),
    } as Record<string, unknown>
})

jest.mock('../../utils', () => {
    return {
        ...require.requireActual('../../utils'),
        isCurrentlyOnTicket: jest.fn(),
    } as Record<string, unknown>
})

describe('Config: socketEvents', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('sendEvents', () => {
        const {sendEvents} = socketEvents

        it('is array', () => {
            expect(_isArray(sendEvents)).toBe(true)
        })

        it('is array of objects', () => {
            expect(_isObject(sendEvents[0])).toBe(true)
        })

        it('structure of objects', () => {
            sendEvents.forEach((event) => {
                expect(event).toHaveProperty('name')
                expect(event).toHaveProperty('dataToSend')

                const dataToSend = event.dataToSend()
                expect(_isObject(dataToSend)).toBe(true)
                expect(dataToSend).toHaveProperty('event')
            })
        })
    })

    describe('joinEvents', () => {
        const {joinEvents} = socketEvents

        it('is array', () => {
            expect(_isArray(joinEvents)).toBe(true)
        })

        it('is array of objects', () => {
            expect(_isObject(joinEvents[0])).toBe(true)
        })

        it('structure of objects', () => {
            joinEvents.forEach((event) => {
                expect(event).toHaveProperty('name')
                expect(event).toHaveProperty('dataToSend')

                const dataToSend = event.dataToSend()
                expect(_isObject(dataToSend)).toBe(true)
                expect(dataToSend).toHaveProperty('dataType')
                expect(dataToSend).toHaveProperty('data')
            })
        })

        it('Should stop typing when leaving ticket room', () => {
            const ticketJoinEvent = _find(joinEvents, {name: 'ticket'})

            class MockSocketManager {
                ticketOnLeaveJoinEvent = ticketJoinEvent
                    ? ticketJoinEvent.onLeave
                    : null
                send = jest.fn()
            }

            const mockSocketManager = new MockSocketManager()
            const ticketId = '1234'

            if (mockSocketManager.ticketOnLeaveJoinEvent) {
                mockSocketManager.ticketOnLeaveJoinEvent(ticketId)
            }

            expect(mockSocketManager.send).toHaveBeenCalledWith(
                SocketEventType.AgentTypingStopped,
                ticketId
            )
        })
    })

    describe('receivedEvents', () => {
        const {receivedEvents} = socketEvents

        it('is array', () => {
            expect(_isArray(receivedEvents)).toBe(true)
        })

        it('is array of objects', () => {
            expect(_isObject(receivedEvents[0])).toBe(true)
        })

        it('structure of objects', () => {
            receivedEvents.forEach((event) => {
                expect(event).toHaveProperty('name')
                expect(event).toHaveProperty('onReceive')
            })
        })

        describe('ACCOUNT_UPDATED handler', () => {
            const accountUpdatedHandler = _find(receivedEvents, {
                name: SocketEventType.AccountUpdated,
            })

            beforeEach(() => {
                jest.resetAllMocks()
            })

            it('should dispatch handleUsageBanner', () => {
                const spy = jest.spyOn(notificationActions, 'handleUsageBanner')

                ;(currentAccountSelectors.getTicketAssignmentSettings as jest.MockedFunction<
                    typeof currentAccountSelectors.getTicketAssignmentSettings
                >).mockReturnValue(fromJS({}))

                if (accountUpdatedHandler) {
                    accountUpdatedHandler.onReceive({account: {}} as any)
                }

                expect(typeSafeReduxStore.dispatch).toHaveBeenCalledTimes(2)
                expect(spy).toHaveBeenCalledWith({
                    newAccountStatus: 'active',
                    currentAccountStatus: 'active',
                })
            })

            it('should not fetch chats because `ticket_assignment` settings do not exist', () => {
                const account = {
                    settings: [],
                }

                ;(currentAccountSelectors.getTicketAssignmentSettings as jest.MockedFunction<
                    typeof currentAccountSelectors.getTicketAssignmentSettings
                >).mockReturnValue(fromJS({}))

                if (accountUpdatedHandler) {
                    accountUpdatedHandler.onReceive({account: account} as any)
                }
                expect(chatActions.fetchChatsThrottled).not.toHaveBeenCalled()
                expect(typeSafeReduxStore.dispatch).toHaveBeenCalledWith({
                    type: currentAccountConstants.UPDATE_ACCOUNT_SUCCESS,
                    resp: account,
                })
            })

            it('should fetch chats because `ticket_assignment` settings were just created', () => {
                const account = {
                    settings: [
                        {
                            type:
                                currentAccountConstants.SETTING_TYPE_TICKET_ASSIGNMENT,
                            data: {auto_assign_to_teams: false},
                        },
                    ],
                }

                ;(currentAccountSelectors.getTicketAssignmentSettings as jest.MockedFunction<
                    typeof currentAccountSelectors.getTicketAssignmentSettings
                >).mockReturnValue(fromJS({}))

                if (accountUpdatedHandler) {
                    accountUpdatedHandler.onReceive({account: account} as any)
                }
                expect(chatActions.fetchChatsThrottled).toHaveBeenCalled()
                expect(typeSafeReduxStore.dispatch).toHaveBeenCalledWith({
                    type: currentAccountConstants.UPDATE_ACCOUNT_SUCCESS,
                    resp: account,
                })
            })

            it.each([
                [false, true],
                [true, false],
            ])(
                'should fetch chats because the auto_assign setting has changed',
                (oldAutoAssignToTeams, newAutoAssignToTeams) => {
                    const account = {
                        settings: [
                            {
                                type:
                                    currentAccountConstants.SETTING_TYPE_TICKET_ASSIGNMENT,
                                data: {
                                    auto_assign_to_teams: newAutoAssignToTeams,
                                },
                            },
                        ],
                    }

                    ;(currentAccountSelectors.getTicketAssignmentSettings as jest.MockedFunction<
                        typeof currentAccountSelectors.getTicketAssignmentSettings
                    >).mockReturnValue(
                        fromJS({
                            data: {
                                auto_assign_to_teams: oldAutoAssignToTeams,
                            },
                        })
                    )

                    if (accountUpdatedHandler) {
                        accountUpdatedHandler.onReceive({
                            account: account,
                        } as any)
                    }
                    expect(chatActions.fetchChatsThrottled).toHaveBeenCalled()
                    expect(typeSafeReduxStore.dispatch).toHaveBeenCalledWith({
                        type: currentAccountConstants.UPDATE_ACCOUNT_SUCCESS,
                        resp: account,
                    })
                }
            )

            it.each([true, false])(
                'should not fetch chats because the auto_assign setting did not change',
                (autoAssignToTeams) => {
                    const account = {
                        settings: [
                            {
                                type:
                                    currentAccountConstants.SETTING_TYPE_TICKET_ASSIGNMENT,
                                data: {auto_assign_to_teams: autoAssignToTeams},
                            },
                        ],
                    }

                    ;(currentAccountSelectors.getTicketAssignmentSettings as jest.MockedFunction<
                        typeof currentAccountSelectors.getTicketAssignmentSettings
                    >).mockReturnValue(
                        fromJS({
                            data: {
                                auto_assign_to_teams: autoAssignToTeams,
                            },
                        })
                    )

                    if (accountUpdatedHandler) {
                        accountUpdatedHandler.onReceive({
                            account: account,
                        } as any)
                    }
                    expect(
                        chatActions.fetchChatsThrottled
                    ).not.toHaveBeenCalled()
                    expect(typeSafeReduxStore.dispatch).toHaveBeenCalledWith({
                        type: currentAccountConstants.UPDATE_ACCOUNT_SUCCESS,
                        resp: account,
                    })
                }
            )
        })

        describe('TICKET_MESSAGE_CHAT_CREATED handler', () => {
            const ticketMessageChatCreatedHandler = _find(receivedEvents, {
                name: SocketEventType.TicketMessageChatCreated,
            })

            class MockSocketManager {
                ticketMessageChatCreatedHandler = ticketMessageChatCreatedHandler
                    ? ticketMessageChatCreatedHandler.onReceive
                    : null
                send = jest.fn()
            }

            const mockSocketManager = new MockSocketManager()

            it.each([true, false])(
                'should add ticket to recent chats because `shouldTicketBeDisplayedInRecentChats` ' +
                    'returned `true`, and not have marked it as read because the current user is not viewing the ticket',
                (lastMessageFromAgent) => {
                    ;(shouldTicketBeDisplayedInRecentChats as jest.MockedFunction<
                        typeof shouldTicketBeDisplayedInRecentChats
                    >).mockReturnValue(true)
                    ;(isCurrentlyOnTicket as jest.MockedFunction<
                        typeof isCurrentlyOnTicket
                    >).mockReturnValue(false)

                    const ticket = {
                        id: 1,
                        status: TicketStatuses.OPEN,
                        spam: false,
                        trashed_datetime: null,
                        deleted_datetime: null,
                        assignee_user_id: 123,
                        is_unread: true,
                        last_message_from_agent: lastMessageFromAgent,
                    }

                    if (mockSocketManager.ticketMessageChatCreatedHandler) {
                        mockSocketManager.ticketMessageChatCreatedHandler({
                            data: ticket,
                        } as any)
                    }
                    expect(chatActions.addChat).toHaveBeenCalledWith(
                        ticket,
                        !lastMessageFromAgent
                    )
                }
            )

            it.each([true, false])(
                'should add ticket to recent chats because `shouldTicketBeDisplayedInRecentChats` ' +
                    'returned `true`,  and have marked it as read because the current user is viewing the ticket ',
                (lastMessageFromAgent) => {
                    ;(shouldTicketBeDisplayedInRecentChats as jest.MockedFunction<
                        typeof shouldTicketBeDisplayedInRecentChats
                    >).mockReturnValue(true)
                    ;(isCurrentlyOnTicket as jest.MockedFunction<
                        typeof isCurrentlyOnTicket
                    >).mockReturnValue(true)

                    const ticket = {
                        id: 1,
                        status: TicketStatuses.OPEN,
                        spam: false,
                        trashed_datetime: null,
                        deleted_datetime: null,
                        assignee_user_id: 123,
                        is_unread: true,
                        last_message_from_agent: lastMessageFromAgent,
                    }

                    const expectedTicket = {
                        ...ticket,
                        is_unread: false,
                    }

                    if (mockSocketManager.ticketMessageChatCreatedHandler) {
                        mockSocketManager.ticketMessageChatCreatedHandler({
                            data: ticket,
                        } as any)
                    }
                    expect(chatActions.addChat).toHaveBeenCalledWith(
                        expectedTicket,
                        !lastMessageFromAgent
                    )
                }
            )

            it(
                'should remove ticket from recent chats because `shouldTicketBeDisplayedInRecentChats` returned ' +
                    '`false`, and then fetch chats from the API because there is now a free slot available in the ' +
                    'recent chats section',
                () => {
                    ;(shouldTicketBeDisplayedInRecentChats as jest.MockedFunction<
                        typeof shouldTicketBeDisplayedInRecentChats
                    >).mockReturnValue(false)

                    const ticket = {
                        id: 1,
                        status: TicketStatuses.OPEN,
                        spam: false,
                        trashed_datetime: null,
                        deleted_datetime: null,
                        assignee_user_id: 123,
                    }

                    if (mockSocketManager.ticketMessageChatCreatedHandler) {
                        mockSocketManager.ticketMessageChatCreatedHandler({
                            data: ticket,
                        } as any)
                    }
                    expect(chatActions.removeChat).toHaveBeenCalledWith(
                        ticket.id
                    )
                    expect(
                        chatActions.fetchChatsThrottled
                    ).toHaveBeenCalledWith(typeSafeReduxStore.dispatch)
                }
            )
        })

        describe('TICKET_CHAT_UPDATED handler', () => {
            const ticketChatUpdatedHandler = _find(receivedEvents, {
                name: SocketEventType.TicketChatUpdated,
            })

            it('should add ticket to recent chats because `shouldTicketBeDisplayedInRecentChats` returned `true`', () => {
                ;(shouldTicketBeDisplayedInRecentChats as jest.MockedFunction<
                    typeof shouldTicketBeDisplayedInRecentChats
                >).mockReturnValue(true)

                const ticket = {
                    id: 1,
                    status: TicketStatuses.OPEN,
                    spam: false,
                    trashed_datetime: null,
                    deleted_datetime: null,
                    assignee_user_id: 123,
                }

                if (ticketChatUpdatedHandler) {
                    ticketChatUpdatedHandler.onReceive({data: ticket} as any)
                }
                expect(chatActions.addChat).toHaveBeenCalledWith(ticket, false)
            })

            it('should remove ticket from recent chats because `shouldTicketBeDisplayedInRecentChats` returned `false`', () => {
                ;(shouldTicketBeDisplayedInRecentChats as jest.MockedFunction<
                    typeof shouldTicketBeDisplayedInRecentChats
                >).mockReturnValue(false)

                const ticket = {
                    id: 1,
                    status: TicketStatuses.OPEN,
                    spam: false,
                    trashed_datetime: null,
                    deleted_datetime: null,
                    assignee_user_id: 123,
                }

                if (ticketChatUpdatedHandler) {
                    ticketChatUpdatedHandler.onReceive({data: ticket} as any)
                }
                expect(chatActions.removeChat).toHaveBeenCalledWith(ticket.id)
            })

            it(
                'should fetch chats from the API because a ticket was removed from recent chats and there is now ' +
                    'a free slot available in the recent chats section',
                () => {
                    ;(shouldTicketBeDisplayedInRecentChats as jest.MockedFunction<
                        typeof shouldTicketBeDisplayedInRecentChats
                    >).mockReturnValue(false)

                    const ticket = {
                        id: 1,
                        status: TicketStatuses.OPEN,
                        spam: false,
                        trashed_datetime: null,
                        deleted_datetime: null,
                        assignee_user_id: 123,
                    }

                    if (ticketChatUpdatedHandler) {
                        ticketChatUpdatedHandler.onReceive({
                            data: ticket,
                        } as any)
                    }
                    expect(
                        chatActions.fetchChatsThrottled
                    ).toHaveBeenCalledWith(typeSafeReduxStore.dispatch)
                }
            )
        })

        describe('FACEBOOK_INTEGRATIONS_RECONNECTED handler', () => {
            const handler = _find(receivedEvents, {
                name: SocketEventType.FacebookIntegrationsReconnected,
            })

            it('should fetch integrations', () => {
                const spy = jest.spyOn(integrationActions, 'fetchIntegrations')
                if (handler) {
                    handler.onReceive({event: {total: 1}} as any)
                }
                expect(spy).toHaveBeenCalled()
            })

            it('should notify', () => {
                const spy = jest.spyOn(notificationActions, 'notify')

                if (handler) {
                    handler.onReceive({event: {total: 1}} as any)
                }
                expect(spy).toHaveBeenCalledWith({
                    status: 'success',
                    message: 'One Facebook page has been reconnected.',
                })

                if (handler) {
                    handler.onReceive({event: {total: 2}} as any)
                }
                expect(spy).toHaveBeenCalledWith({
                    status: 'success',
                    message: '2 Facebook pages have been reconnected.',
                })
            })
        })

        describe('VIEWS_DEACTIVATED handler', () => {
            const handler = _find(receivedEvents, {
                name: SocketEventType.ViewsDeactivated,
            })

            it.each([[['Foo']], [['Foo', 'Bar']]])('should notify', (names) => {
                const spy = jest.spyOn(notificationActions, 'notify')

                if (handler) {
                    handler.onReceive({event: {names}} as any)
                }

                expect(spy.mock.calls).toMatchSnapshot()
            })
        })
    })
})
