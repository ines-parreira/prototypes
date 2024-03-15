import {fromJS} from 'immutable'
import _find from 'lodash/find'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import {EnhancedStore} from '@reduxjs/toolkit'

import {TicketChannel} from 'business/types/ticket'
import browserNotification from 'services/browserNotification'
import {
    advancedMonthlyHelpdeskPrice,
    HELPDESK_PRODUCT_ID,
    proMonthlyHelpdeskPrice as mockedProMonthlyHelpdeskPrice,
} from 'fixtures/productPrices'
import * as currentUserActions from 'state/currentUser/actions'
import {HelpdeskPrice} from 'models/billing/types'
import {TicketStatuses} from 'business/ticket'
import {shouldTicketBeDisplayedInRecentChats} from 'business/recentChats'

import * as chatActions from 'state/chats/actions'
import * as currentAccountConstants from 'state/currentAccount/constants'
import * as currentAccountSelectors from 'state/currentAccount/selectors'
import * as billingSelectors from 'state/billing/selectors'
import {viewsCountFetched} from 'state/entities/viewsCount/actions'
import * as integrationActions from 'state/integrations/actions'
import * as notificationActions from 'state/notifications/actions'
import {handleViewsCount} from 'state/views/actions'
import {
    CustomerExternalDataUpdatedEvent,
    OrderEvent,
    OutboundPhoneCallInitiated,
    ReceivedEvent,
    ShopperAddressEvent,
    ShopperEvent,
    SocketEventType,
} from 'services/socketManager/types'
import {view} from 'fixtures/views'
import {
    viewCreated,
    viewUpdated,
    viewDeleted,
} from 'state/entities/views/actions'
import {isViewSharedWithUser} from 'state/views/utils'

import {isCurrentlyOnTicket} from 'utils'
import {store as reduxStore} from 'common/store'
import {section} from 'fixtures/section'
import {
    sectionCreated,
    sectionDeleted,
    sectionUpdated,
} from 'state/entities/sections/actions'
import * as ticketActions from 'state/ticket/actions'
import history from 'pages/history'
import {
    mergeCustomerEcommerceDataOrder,
    mergeCustomerEcommerceDataShopper,
    mergeCustomerEcommerceDataShopperAddress,
    mergeCustomerExternalData,
} from 'state/ticket/actions'
import * as voiceCallTypes from 'models/voiceCall/types'
import {appQueryClient} from 'api/queryClient'
import {voiceCallsKeys} from 'models/voiceCall/queries'
import * as activityTracker from 'services/activityTracker'
import {ActivityEvents} from 'services/activityTracker'

import {
    ecommerceStoreFixture,
    shopperAddressFixture,
    shopperFixture,
    shopperOrderFixture,
} from 'models/customerEcommerceData/fixtures'
import receivedEvents from '../receivedEvents'

//$TsFixMe remove once init.js is migrated
const typeSafeReduxStore = reduxStore as EnhancedStore

jest.mock('services/browserNotification', () => ({newMessage: jest.fn()}))

jest.spyOn(browserNotification, 'newMessage')
jest.mock('state/chats/actions')
jest.mock('state/views/actions')
jest.mock('state/entities/viewsCount/actions')
jest.mock('state/ticket/actions')
jest.mock('state/currentUser/actions')
jest.mock('services/activityTracker')

jest.mock('common/store', () => {
    /* eslint-disable @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-member-access */
    const {fromJS}: {fromJS: (value: any) => any} = require('immutable')
    const {MAX_RECENT_CHATS} = require('config/recentChats')
    const configureMockStore: (t: any) => (y: any) => {dispatch: any} =
        require('redux-mock-store').default
    const thunk = require('redux-thunk').default
    /* eslint-enable */

    const mockStore = configureMockStore([thunk])
    const store = mockStore({
        billing: fromJS({products: [mockedProMonthlyHelpdeskPrice]}),
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

jest.mock('state/currentAccount/selectors', () => {
    return {
        ...jest.requireActual('state/currentAccount/selectors'),
        getTicketAssignmentSettings: jest.fn(),
    } as Record<string, unknown>
})

jest.mock('business/recentChats', () => {
    return {
        ...jest.requireActual('business/recentChats.ts'),
        shouldTicketBeDisplayedInRecentChats: jest.fn(),
    } as Record<string, unknown>
})

jest.mock('utils', () => {
    return {
        ...jest.requireActual('utils'),
        isCurrentlyOnTicket: jest.fn(),
    } as Record<string, unknown>
})

jest.mock('state/entities/views/actions')

jest.mock('state/views/utils')

describe('receivedEvents', () => {
    afterEach(() => {
        window.location.pathname = ''
        window.CLIENT_ID = ''
        jest.useRealTimers()
        jest.resetAllMocks()
    })

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
        const getPricesMapSpy = jest.spyOn(billingSelectors, 'getPricesMap')

        beforeEach(() => {
            jest.useFakeTimers()
            getPricesMapSpy.mockImplementation(
                () =>
                    ({
                        [mockedProMonthlyHelpdeskPrice.price_id]:
                            mockedProMonthlyHelpdeskPrice,
                    } as Record<string, HelpdeskPrice>)
            )
        })

        it('should dispatch handleUsageBanner', () => {
            const spy = jest.spyOn(notificationActions, 'handleUsageBanner')

            ;(
                currentAccountSelectors.getTicketAssignmentSettings as jest.MockedFunction<
                    typeof currentAccountSelectors.getTicketAssignmentSettings
                >
            ).mockReturnValue(fromJS({}))

            if (accountUpdatedHandler) {
                accountUpdatedHandler.onReceive({
                    account: {
                        current_subscription: {
                            products: {},
                        },
                    },
                } as any)
            }

            expect(typeSafeReduxStore.dispatch).toHaveBeenCalledTimes(2)
            expect(spy).toHaveBeenCalledWith({
                newAccountStatus: 'active',
                currentAccountStatus: 'active',
            })
        })

        it('should not fetch chats because `ticket_assignment` settings do not exist', () => {
            const account = {
                current_subscription: {
                    products: {},
                },
                settings: [],
            }

            ;(
                currentAccountSelectors.getTicketAssignmentSettings as jest.MockedFunction<
                    typeof currentAccountSelectors.getTicketAssignmentSettings
                >
            ).mockReturnValue(fromJS({}))

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
                current_subscription: {
                    products: {},
                },
                settings: [
                    {
                        type: currentAccountConstants.SETTING_TYPE_TICKET_ASSIGNMENT,
                        data: {auto_assign_to_teams: false},
                    },
                ],
            }

            ;(
                currentAccountSelectors.getTicketAssignmentSettings as jest.MockedFunction<
                    typeof currentAccountSelectors.getTicketAssignmentSettings
                >
            ).mockReturnValue(fromJS({}))

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
                    current_subscription: {
                        products: {},
                    },
                    settings: [
                        {
                            type: currentAccountConstants.SETTING_TYPE_TICKET_ASSIGNMENT,
                            data: {
                                auto_assign_to_teams: newAutoAssignToTeams,
                            },
                        },
                    ],
                }

                ;(
                    currentAccountSelectors.getTicketAssignmentSettings as jest.MockedFunction<
                        typeof currentAccountSelectors.getTicketAssignmentSettings
                    >
                ).mockReturnValue(
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
                    current_subscription: {
                        products: {},
                    },
                    settings: [
                        {
                            type: currentAccountConstants.SETTING_TYPE_TICKET_ASSIGNMENT,
                            data: {auto_assign_to_teams: autoAssignToTeams},
                        },
                    ],
                }

                ;(
                    currentAccountSelectors.getTicketAssignmentSettings as jest.MockedFunction<
                        typeof currentAccountSelectors.getTicketAssignmentSettings
                    >
                ).mockReturnValue(
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
                expect(chatActions.fetchChatsThrottled).not.toHaveBeenCalled()
                expect(typeSafeReduxStore.dispatch).toHaveBeenCalledWith({
                    type: currentAccountConstants.UPDATE_ACCOUNT_SUCCESS,
                    resp: account,
                })
            }
        )

        it('should not notify and reload app if new account price is preloaded', () => {
            const spy = jest.spyOn(notificationActions, 'notify')
            ;(
                currentAccountSelectors.getTicketAssignmentSettings as jest.MockedFunction<
                    typeof currentAccountSelectors.getTicketAssignmentSettings
                >
            ).mockReturnValue(fromJS({}))

            if (accountUpdatedHandler) {
                accountUpdatedHandler.onReceive({
                    account: {
                        current_subscription: {
                            products: {
                                [HELPDESK_PRODUCT_ID]:
                                    mockedProMonthlyHelpdeskPrice.price_id,
                            },
                        },
                    },
                } as any)
            }

            expect(spy).not.toHaveBeenCalledWith({
                message:
                    'The app will reload automatically in a few seconds to reflect your subscription changes.',
            })
            jest.runAllTimers()
            expect(window.location.reload).not.toHaveBeenCalled()
        })

        it('should notify and reload app if new account price is not preloaded', () => {
            const spy = jest.spyOn(notificationActions, 'notify')
            ;(
                currentAccountSelectors.getTicketAssignmentSettings as jest.MockedFunction<
                    typeof currentAccountSelectors.getTicketAssignmentSettings
                >
            ).mockReturnValue(fromJS({}))

            if (accountUpdatedHandler) {
                accountUpdatedHandler.onReceive({
                    account: {
                        current_subscription: {
                            products: {
                                [HELPDESK_PRODUCT_ID]:
                                    advancedMonthlyHelpdeskPrice.price_id,
                            },
                        },
                    },
                } as any)
            }

            expect(spy).toHaveBeenCalledWith({
                message:
                    'The app will reload automatically in a few seconds to reflect your subscription changes.',
            })
            jest.runAllTimers()
            expect(window.location.reload).toHaveBeenCalled()
        })
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
                ;(
                    shouldTicketBeDisplayedInRecentChats as jest.MockedFunction<
                        typeof shouldTicketBeDisplayedInRecentChats
                    >
                ).mockReturnValue(true)
                ;(
                    isCurrentlyOnTicket as jest.MockedFunction<
                        typeof isCurrentlyOnTicket
                    >
                ).mockReturnValue(false)

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
                ;(
                    shouldTicketBeDisplayedInRecentChats as jest.MockedFunction<
                        typeof shouldTicketBeDisplayedInRecentChats
                    >
                ).mockReturnValue(true)
                ;(
                    isCurrentlyOnTicket as jest.MockedFunction<
                        typeof isCurrentlyOnTicket
                    >
                ).mockReturnValue(true)

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
                ;(
                    shouldTicketBeDisplayedInRecentChats as jest.MockedFunction<
                        typeof shouldTicketBeDisplayedInRecentChats
                    >
                ).mockReturnValue(false)

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
                expect(chatActions.removeChat).toHaveBeenCalledWith(ticket.id)
                expect(chatActions.fetchChatsThrottled).toHaveBeenCalledWith(
                    typeSafeReduxStore.dispatch
                )
            }
        )
    })

    describe('TICKET_CHAT_UPDATED handler', () => {
        const ticketChatUpdatedHandler = _find(receivedEvents, {
            name: SocketEventType.TicketChatUpdated,
        })

        it('should add ticket to recent chats because `shouldTicketBeDisplayedInRecentChats` returned `true`', () => {
            ;(
                shouldTicketBeDisplayedInRecentChats as jest.MockedFunction<
                    typeof shouldTicketBeDisplayedInRecentChats
                >
            ).mockReturnValue(true)

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
            ;(
                shouldTicketBeDisplayedInRecentChats as jest.MockedFunction<
                    typeof shouldTicketBeDisplayedInRecentChats
                >
            ).mockReturnValue(false)

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
                ;(
                    shouldTicketBeDisplayedInRecentChats as jest.MockedFunction<
                        typeof shouldTicketBeDisplayedInRecentChats
                    >
                ).mockReturnValue(false)

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
                expect(chatActions.fetchChatsThrottled).toHaveBeenCalledWith(
                    typeSafeReduxStore.dispatch
                )
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

    describe('VIEW_DEACTIVATED handler', () => {
        const handler = _find(receivedEvents, {
            name: SocketEventType.ViewDeactivated,
        })

        it('should notify', () => {
            const event = {
                name: 'Foo',
            }

            const spy = jest.spyOn(notificationActions, 'notify')

            if (handler) {
                handler.onReceive({event: event} as any)
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
                    tab_id: 'abc123',
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
                    tab_id: 'abc123',
                },
            }
            handler?.onReceive(data)

            expect(spy.mock.calls).toEqual([])
        })

        it('should log activity event', () => {
            const originalTicketId = 123
            const originalPath = `/app/ticket/${originalTicketId}`
            window.location.pathname = originalPath
            window.CLIENT_ID = 'abc123'

            const spy = jest.spyOn(activityTracker, 'logActivityEvent')
            const data: OutboundPhoneCallInitiated = {
                event: {
                    type: SocketEventType.OutboundPhoneCallInitiated,
                    phone_ticket_id: 456,
                    original_path: originalPath,
                    tab_id: 'abc123',
                },
            }
            handler?.onReceive(data)

            expect(spy).toHaveBeenCalledWith(
                ActivityEvents.UserStartedPhoneCall,
                {entityId: 456, entityType: 'ticket'}
            )
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
                name: SocketEventType.ViewSectionCreated,
            }) as ReceivedEvent
            handler.onReceive({
                event: {
                    type: SocketEventType.ViewSectionCreated,
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
                name: SocketEventType.ViewSectionUpdated,
            }) as ReceivedEvent
            handler.onReceive({
                event: {
                    type: SocketEventType.ViewSectionUpdated,
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
                name: SocketEventType.ViewSectionDeleted,
            }) as ReceivedEvent
            handler.onReceive({
                event: {
                    type: SocketEventType.ViewSectionDeleted,
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
        }) as ReceivedEvent

        it('should dispatch the new view', () => {
            handler.onReceive({view} as any)
            expect(viewCreated).toHaveBeenNthCalledWith(1, view)
        })
    })

    describe('view-updated', () => {
        const handler = _find(receivedEvents, {
            name: 'view-updated',
        }) as ReceivedEvent

        it('should dispatch the updated view', () => {
            ;(
                isViewSharedWithUser as jest.MockedFunction<
                    typeof isViewSharedWithUser
                >
            ).mockImplementationOnce(() => true)
            handler.onReceive({view} as any)
            expect(viewUpdated).toHaveBeenNthCalledWith(1, view)
        })

        it('should dispatch the hidden view', () => {
            ;(
                isViewSharedWithUser as jest.MockedFunction<
                    typeof isViewSharedWithUser
                >
            ).mockImplementationOnce(() => false)
            handler.onReceive({view} as any)
            expect(viewDeleted).toHaveBeenNthCalledWith(1, view.id)
        })
    })

    describe('view-deleted', () => {
        const handler = _find(receivedEvents, {
            name: 'view-deleted',
        }) as ReceivedEvent

        it('should dispatch the deleted view', () => {
            handler.onReceive({view} as any)
            expect(viewDeleted).toHaveBeenNthCalledWith(1, view.id)
        })
    })

    describe('ticket-updated', () => {
        const handler = _find(receivedEvents, {
            name: 'ticket-updated',
        }) as ReceivedEvent

        it('should dispatch the updated ticket', () => {
            handler.onReceive({ticket: {id: 1}} as any)
            expect(ticketActions.mergeTicket).toHaveBeenNthCalledWith(1, {
                id: 1,
            })
        })

        it('should dispatch the updated chat when is unread', () => {
            handler.onReceive({ticket: {id: 1, is_unread: true}} as any)
            expect(chatActions.markChatAsUnread).toHaveBeenNthCalledWith(1, 1)
        })
    })

    describe('ticket-assigned', () => {
        const handler = _find(receivedEvents, {
            name: 'ticket-assigned',
        }) as ReceivedEvent

        it('should send a browser notification', () => {
            handler.onReceive({
                event: {
                    type: 'ticket-assigned',
                },
                ticket: {
                    id: 1,
                    channel: TicketChannel.Email,
                    subject: 'Foo bar',
                },
            })

            expect(browserNotification.newMessage).toHaveBeenNthCalledWith(1, {
                body: `New assigned ticket [${TicketChannel.Email}]: Foo bar`,
                ticketId: 1,
                requireInteraction: true,
            })
        })
    })

    describe('agent-availability-updated', () => {
        const handler = _find(receivedEvents, {
            name: SocketEventType.AgentAvailabilityUpdated,
        }) as ReceivedEvent

        it('should dispatch the availability status', () => {
            handler.onReceive({
                event: {type: SocketEventType.AgentAvailabilityUpdated},
                data: {user_id: 1, available: true},
            })

            expect(currentUserActions.setIsAvailable).toHaveBeenNthCalledWith(
                1,
                true
            )
            expect(chatActions.fetchChatsThrottled).toHaveBeenCalled()
        })
    })

    describe(SocketEventType.CustomerExternalDataUpdated, () => {
        const handler = _find(receivedEvents, {
            name: SocketEventType.CustomerExternalDataUpdated,
        }) as ReceivedEvent

        it('should dispatch the updated external data for customer id', () => {
            const customerExternalDataUpdatedEvent = {
                event: {type: SocketEventType.CustomerExternalDataUpdated},
                customer_id: 123,
                external_data: {
                    'my-awesome-app-id-1': {
                        badge: 'Best customer',
                        __app_name__: 'foo',
                    },
                },
            } as CustomerExternalDataUpdatedEvent
            handler.onReceive(customerExternalDataUpdatedEvent)
            expect(mergeCustomerExternalData).toHaveBeenNthCalledWith(
                1,
                customerExternalDataUpdatedEvent.customer_id,
                customerExternalDataUpdatedEvent.external_data
            )
        })
    })

    describe(SocketEventType.TicketTypingActivityShopperStarted, () => {
        const handler = _find(receivedEvents, {
            name: SocketEventType.TicketTypingActivityShopperStarted,
        }) as ReceivedEvent

        it('should dispatch a shopper typing activity update', () => {
            handler.onReceive({
                event: {
                    type: SocketEventType.TicketTypingActivityShopperStarted,
                },
                ticket: {id: 100},
            })

            expect(ticketActions.setTypingActivityShopper).toHaveBeenCalledWith(
                100
            )
        })
    })

    describe('MigrationIntegrationInbound events', () => {
        const migration = {
            integration: {
                id: 1,
                meta: {
                    address: 'address@gorgias.com',
                },
            },
        }

        it('MigrationIntegrationInboundVerified - should find migration and dispatch onVerifyMigrationForwarding action with correct args', () => {
            const handler = _find(receivedEvents, {
                name: SocketEventType.MigrationIntegrationInboundVerified,
            }) as ReceivedEvent

            jest.spyOn(reduxStore, 'getState').mockReturnValueOnce({
                integrations: fromJS({
                    migrations: {
                        email: [migration],
                    },
                }),
            })
            const spy = jest.spyOn(
                integrationActions,
                'onVerifyMigrationForwarding'
            )

            handler.onReceive({
                event: {
                    type: SocketEventType.EmailIntegrationVerified,
                },
                integration_id: 1,
            })

            expect(spy).toHaveBeenCalledWith(
                reduxStore.dispatch,
                migration.integration.id,
                migration.integration.meta.address
            )
        })

        it('MigrationIntegrationInboundFailed - should find migration and dispatch onVerifyMigrationForwardingFailure action with correct args', () => {
            const handler = _find(receivedEvents, {
                name: SocketEventType.MigrationIntegrationInboundFailed,
            }) as ReceivedEvent

            jest.spyOn(reduxStore, 'getState').mockReturnValueOnce({
                integrations: fromJS({
                    migrations: {
                        email: [migration],
                    },
                }),
            })
            const spy = jest.spyOn(
                integrationActions,
                'onVerifyMigrationForwardingFailure'
            )

            handler.onReceive({
                event: {
                    type: SocketEventType.EmailIntegrationVerified,
                },
                integration_id: 1,
            })

            expect(spy).toHaveBeenCalledWith(
                reduxStore.dispatch,
                migration.integration.id,
                migration.integration.meta.address
            )
        })
    })

    describe('voice-call-created', () => {
        it('should update query cache', () => {
            const handler = _find(receivedEvents, {
                name: SocketEventType.VoiceCallCreated,
            }) as ReceivedEvent

            const isVoiceCallSpy = jest.spyOn(voiceCallTypes, 'isVoiceCall')
            isVoiceCallSpy.mockReturnValueOnce(true)

            const voiceCall = {
                id: 1,
                ticket_id: 123,
            } as voiceCallTypes.VoiceCall
            const queryKey = voiceCallsKeys.list({
                ticket_id: voiceCall.ticket_id,
            })

            appQueryClient.setQueryData(queryKey, {data: [{id: 2}]})

            handler.onReceive({
                event: {
                    type: SocketEventType.VoiceCallCreated,
                },
                voice_call: voiceCall,
            })
            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: [{id: 2}, voiceCall],
            })
        })
    })

    describe('voice-call-updated', () => {
        it('should update query cache when voiceCall exists', () => {
            const handler = _find(receivedEvents, {
                name: SocketEventType.VoiceCallUpdated,
            }) as ReceivedEvent

            const isVoiceCallSpy = jest.spyOn(voiceCallTypes, 'isVoiceCall')

            isVoiceCallSpy.mockReturnValueOnce(true)
            const voiceCall = {
                id: 1,
                ticket_id: 123,
            } as voiceCallTypes.VoiceCall
            const queryKey = voiceCallsKeys.list({
                ticket_id: voiceCall.ticket_id,
            })

            appQueryClient.setQueryData(queryKey, {
                data: [{id: 1}, {id: 2}],
            })

            handler.onReceive({
                event: {
                    type: SocketEventType.VoiceCallUpdated,
                },
                voice_call: voiceCall,
            })
            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: [voiceCall, {id: 2}],
            })
        })

        it('should not update query cache when voiceCall does not exist', () => {
            const handler = _find(receivedEvents, {
                name: SocketEventType.VoiceCallUpdated,
            }) as ReceivedEvent

            const isVoiceCallSpy = jest.spyOn(voiceCallTypes, 'isVoiceCall')
            isVoiceCallSpy.mockReturnValueOnce(true)

            const voiceCall = {
                id: 3,
                ticket_id: 123,
            } as voiceCallTypes.VoiceCall
            const queryKey = voiceCallsKeys.list({
                ticket_id: voiceCall.ticket_id,
            })

            appQueryClient.setQueryData(queryKey, {
                data: [{id: 1}, {id: 2}],
            })

            handler.onReceive({
                event: {
                    type: SocketEventType.VoiceCallUpdated,
                },
                voice_call: voiceCall,
            })
            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: [{id: 1}, {id: 2}],
            })
        })

        describe('Shopper events', () => {
            it.each([
                SocketEventType.ShopperCreated,
                SocketEventType.ShopperUpdated,
            ])(
                'should dispatch the shopper data for customer id',
                (eventType) => {
                    const handler = _find(receivedEvents, {
                        name: eventType,
                    }) as ReceivedEvent
                    const shopperEvent = {
                        event: {
                            type: eventType,
                            data: {
                                customer_id: 123,
                                store: ecommerceStoreFixture,
                                shopper: shopperFixture,
                            },
                        },
                    } as ShopperEvent
                    handler.onReceive(shopperEvent)
                    expect(
                        mergeCustomerEcommerceDataShopper
                    ).toHaveBeenCalledTimes(1)
                }
            )
        })

        describe('Shopper address events', () => {
            it.each([
                SocketEventType.ShopperAddressCreated,
                SocketEventType.ShopperAddressUpdated,
            ])(
                'should dispatch the shopper address data for customer id',
                (eventType) => {
                    const handler = _find(receivedEvents, {
                        name: eventType,
                    }) as ReceivedEvent
                    const shopperEvent = {
                        event: {
                            type: eventType,
                            data: {
                                customer_id: 123,
                                store_uuid: ecommerceStoreFixture.uuid,
                                shopper_address: shopperAddressFixture,
                            },
                        },
                    } as ShopperAddressEvent
                    handler.onReceive(shopperEvent)
                    expect(
                        mergeCustomerEcommerceDataShopperAddress
                    ).toHaveBeenCalledTimes(1)
                }
            )
        })

        describe('Ecommerce order events', () => {
            it.each([
                SocketEventType.OrderCreated,
                SocketEventType.OrderUpdated,
            ])(
                'should dispatch the order data for customer id',
                (eventType) => {
                    const handler = _find(receivedEvents, {
                        name: eventType,
                    }) as ReceivedEvent
                    const orderEvent = {
                        event: {
                            type: eventType,
                            data: {
                                customer_id: 123,
                                store_uuid: ecommerceStoreFixture.uuid,
                                order: shopperOrderFixture,
                            },
                        },
                    } as OrderEvent
                    handler.onReceive(orderEvent)
                    expect(
                        mergeCustomerEcommerceDataOrder
                    ).toHaveBeenCalledTimes(1)
                }
            )
        })
    })
})
