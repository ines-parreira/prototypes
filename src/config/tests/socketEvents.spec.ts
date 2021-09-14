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
import {viewsCountFetched} from '../../state/entities/viewsCount/actions'
import * as integrationActions from '../../state/integrations/actions'
import * as notificationActions from '../../state/notifications/actions'
import {handleViewsCount} from '../../state/views/actions'
import {
    OutboundPhoneCallInitiated,
    SocketEventType,
} from '../../services/socketManager/types'
import * as socketEvents from '../socketEvents'
import {view} from '../../fixtures/views'
import {
    viewCreated,
    viewUpdated,
    viewDeleted,
} from '../../state/entities/views/actions'
import {isViewSharedWithUser} from '../../state/views/utils'

import {isCurrentlyOnTicket} from '../../utils'
import {store as reduxStore} from '../../init'
import {section} from '../../fixtures/section'
import {
    VIEW_SECTION_CREATED,
    VIEW_SECTION_DELETED,
    VIEW_SECTION_UPDATED,
} from '../socketConstants'
import {
    sectionCreated,
    sectionDeleted,
    sectionUpdated,
} from '../../state/entities/sections/actions'
import * as ticketActions from '../../state/ticket/actions'
import history from '../../pages/history'

//$TsFixMe remove once init.js is migrated
const typeSafeReduxStore = reduxStore as EnhancedStore

jest.mock('../../state/chats/actions')
jest.mock('../../state/views/actions')
jest.mock('../../state/entities/viewsCount/actions')
jest.mock('../../state/ticket/actions')

jest.mock('../../init', () => {
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

jest.mock('../../state/entities/views/actions')

jest.mock('../../state/views/utils')

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
                            event: {
                                type: SocketEventType.TicketMessageChatCreated,
                                play_sound_notification: true,
                            },
                            data: ticket,
                        } as any)
                    }
                    expect(chatActions.addChat).toHaveBeenCalledWith(
                        ticket,
                        !lastMessageFromAgent,
                        true
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
                            event: {
                                type: SocketEventType.TicketMessageChatCreated,
                                play_sound_notification: true,
                            },
                            data: ticket,
                        } as any)
                    }
                    expect(chatActions.addChat).toHaveBeenCalledWith(
                        expectedTicket,
                        !lastMessageFromAgent,
                        true
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
                            event: {
                                type: SocketEventType.TicketMessageChatCreated,
                                play_sound_notification: true,
                            },
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

        describe('OutboundPhoneCallInitiated handler', () => {
            const handler = _find(receivedEvents, {
                name: SocketEventType.OutboundPhoneCallInitiated,
            })

            it('should redirect to ticket page because agent is on the original ticket page', () => {
                const originalTicketId = 123
                const originalPath = `/app/ticket/${originalTicketId}`
                window.location.pathname = originalPath

                const spy = jest.spyOn(history, 'push')
                const data: OutboundPhoneCallInitiated = {
                    event: {
                        type: SocketEventType.OutboundPhoneCallInitiated,
                        phone_ticket_id: 456,
                        original_path: originalPath,
                    },
                }
                handler?.onReceive(data)

                expect(spy.mock.calls).toMatchSnapshot()
            })

            it('should not redirect to ticket page because agent is not on the original ticket page', () => {
                const originalTicketId = 123
                const originalPath = `/app/ticket/${originalTicketId}`
                window.location.pathname = `/app/ticket/789`

                const spy = jest.spyOn(history, 'push')
                const data: OutboundPhoneCallInitiated = {
                    event: {
                        type: SocketEventType.OutboundPhoneCallInitiated,
                        phone_ticket_id: 456,
                        original_path: originalPath,
                    },
                }
                handler?.onReceive(data)

                expect(spy.mock.calls).toEqual([])
            })
        })

        describe('views-count-updated', () => {
            const handler = _find(receivedEvents, {
                name: 'views-count-updated',
            })

            it('should dispatch the views count', () => {
                if (handler) {
                    handler.onReceive({counts: {'1': 10, '2': 20}} as any)
                }

                expect(viewsCountFetched).toHaveBeenNthCalledWith(1, {
                    '1': 10,
                    '2': 20,
                })
                expect(handleViewsCount).toHaveBeenNthCalledWith(1, {
                    '1': 10,
                    '2': 20,
                })
            })
        })

        describe('View section events', () => {
            it('should dispatch redux store action for `view-section-created` event', () => {
                const handler = _find(receivedEvents, {
                    name: VIEW_SECTION_CREATED,
                }) as socketEvents.ReceivedEvent
                handler.onReceive({
                    event: {
                        type: VIEW_SECTION_CREATED,
                    },
                    view_section: section,
                })
                expect(typeSafeReduxStore.dispatch).toHaveBeenCalledTimes(1)
                expect(typeSafeReduxStore.dispatch).toHaveBeenCalledWith(
                    sectionCreated(section)
                )
            })

            it('should dispatch redux store action for `view-section-updated` event', () => {
                const handler = _find(receivedEvents, {
                    name: VIEW_SECTION_UPDATED,
                }) as socketEvents.ReceivedEvent
                handler.onReceive({
                    event: {
                        type: VIEW_SECTION_UPDATED,
                    },
                    view_section: section,
                })
                expect(typeSafeReduxStore.dispatch).toHaveBeenCalledTimes(1)
                expect(typeSafeReduxStore.dispatch).toHaveBeenCalledWith(
                    sectionUpdated(section)
                )
            })

            it('should dispatch redux store action for `view-section-deleted` event', () => {
                const handler = _find(receivedEvents, {
                    name: VIEW_SECTION_DELETED,
                }) as socketEvents.ReceivedEvent
                handler.onReceive({
                    event: {
                        type: VIEW_SECTION_DELETED,
                    },
                    view_section: section,
                })
                expect(typeSafeReduxStore.dispatch).toHaveBeenCalledTimes(1)
                expect(typeSafeReduxStore.dispatch).toHaveBeenCalledWith(
                    sectionDeleted(section.id)
                )
            })
        })

        describe('view-created', () => {
            const handler = _find(receivedEvents, {
                name: 'view-created',
            }) as socketEvents.ReceivedEvent

            it('should dispatch the new view', () => {
                handler.onReceive({view} as any)
                expect(viewCreated).toHaveBeenNthCalledWith(1, view)
            })
        })

        describe('view-updated', () => {
            const handler = _find(receivedEvents, {
                name: 'view-updated',
            }) as socketEvents.ReceivedEvent

            it('should dispatch the updated view', () => {
                ;(isViewSharedWithUser as jest.MockedFunction<
                    typeof isViewSharedWithUser
                >).mockImplementationOnce(() => true)
                handler.onReceive({view} as any)
                expect(viewUpdated).toHaveBeenNthCalledWith(1, view)
            })

            it('should dispatch the hidden view', () => {
                ;(isViewSharedWithUser as jest.MockedFunction<
                    typeof isViewSharedWithUser
                >).mockImplementationOnce(() => false)
                handler.onReceive({view} as any)
                expect(viewDeleted).toHaveBeenNthCalledWith(1, view.id)
            })
        })

        describe('view-deleted', () => {
            const handler = _find(receivedEvents, {
                name: 'view-deleted',
            }) as socketEvents.ReceivedEvent

            it('should dispatch the deleted view', () => {
                handler.onReceive({view} as any)
                expect(viewDeleted).toHaveBeenNthCalledWith(1, view.id)
            })
        })

        describe('ticket-updated', () => {
            const handler = _find(receivedEvents, {
                name: 'ticket-updated',
            }) as socketEvents.ReceivedEvent

            it('should dispatch the updated ticket', () => {
                handler.onReceive({ticket: {id: 1}} as any)
                expect(ticketActions.mergeTicket).toHaveBeenNthCalledWith(1, {
                    id: 1,
                })
            })

            it('should dispatch the updated chat when is unread', () => {
                handler.onReceive({ticket: {id: 1, is_unread: true}} as any)
                expect(chatActions.markChatAsUnread).toHaveBeenNthCalledWith(
                    1,
                    1
                )
            })
        })
    })
})
