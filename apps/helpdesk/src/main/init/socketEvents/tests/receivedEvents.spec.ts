// sort-imports-ignore
import {
    advancedMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    proMonthlyHelpdeskPlan as mockedProMonthlyHelpdeskPlan,
} from 'fixtures/plans'

import type { EnhancedStore } from '@reduxjs/toolkit'
import { fromJS } from 'immutable'
import _find from 'lodash/find'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'

import { appQueryClient } from 'api/queryClient'
import { shouldTicketBeDisplayedInRecentChats } from 'business/recentChats'
import { TicketStatuses } from 'business/ticket'
import { store as reduxStore } from 'common/store'
import { section } from 'fixtures/section'
import { view } from 'fixtures/views'
import type { HelpdeskPlan, PlanId } from 'models/billing/types'
import { ProductType } from 'models/billing/types'
import {
    ecommerceStoreFixture,
    shopperAddressFixture,
    shopperFixture,
    shopperOrderFixture,
} from 'models/customerEcommerceData/fixtures'
import { voiceCallsKeys } from 'models/voiceCall/queries'
import * as voiceCallTypes from 'models/voiceCall/types'
import { history } from '@repo/routing'
import * as activityTracker from 'services/activityTracker'
import { ActivityEvents } from 'services/activityTracker'
import browserNotification from 'services/browserNotification'
import type {
    CustomerExternalDataUpdatedEvent,
    OrderEvent,
    OutboundPhoneCallInitiated,
    ReceivedEvent,
    ShopperAddressEvent,
    ShopperEvent,
} from 'services/socketManager/types'
import { SocketEventType } from 'services/socketManager/types'
import * as billingSelectors from 'state/billing/selectors'
import * as chatActions from 'state/chats/actions'
import * as currentAccountConstants from 'state/currentAccount/constants'
import * as currentAccountSelectors from 'state/currentAccount/selectors'
import * as currentUserActions from 'state/currentUser/actions'
import {
    sectionCreated,
    sectionDeleted,
    sectionUpdated,
} from 'state/entities/sections/actions'
import {
    viewCreated,
    viewDeleted,
    viewUpdated,
} from 'state/entities/views/actions'
import { viewsCountFetched } from 'state/entities/viewsCount/actions'
import * as integrationActions from 'state/integrations/actions'
import * as notificationActions from 'state/notifications/actions'
import * as ticketActions from 'state/ticket/actions'
import {
    mergeCustomerEcommerceDataOrder,
    mergeCustomerEcommerceDataShopper,
    mergeCustomerEcommerceDataShopperAddress,
    mergeCustomerExternalData,
} from 'state/ticket/actions'
import { handleViewsCount } from 'state/views/actions'
import { isViewSharedWithUser } from 'state/views/utils'
import { isCurrentlyOnTicket } from 'utils'

import { throttledUpdateCustomerCache } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/helpers'
import { throttledUpdateCustomFieldsCache } from '../helpers'

import receivedEvents from '../receivedEvents'
import { ticket } from 'fixtures/ticket'
import type { TicketMessage } from '@gorgias/helpdesk-types'

//$TsFixMe remove once init.js is migrated
const typeSafeReduxStore = reduxStore as EnhancedStore

jest.mock('services/browserNotification', () => ({ newMessage: jest.fn() }))

jest.spyOn(browserNotification, 'newMessage')
jest.mock('state/chats/actions')
jest.mock('state/views/actions')
jest.mock('state/entities/viewsCount/actions')
jest.mock('state/ticket/actions')
jest.mock('state/currentUser/actions')
jest.mock('services/activityTracker')
jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/helpers',
    () => ({
        ...jest.requireActual(
            'pages/common/components/infobar/Infobar/InfobarCustomerInfo/helpers',
        ),
        throttledUpdateCustomerCache: jest.fn(),
    }),
)
jest.mock('../helpers', () => ({
    ...jest.requireActual('../helpers'),
    throttledUpdateCustomFieldsCache: jest.fn(),
}))

jest.mock('common/store', () => {
    /* eslint-disable @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-member-access */
    const { fromJS }: { fromJS: (value: any) => any } = require('immutable')
    const { MAX_RECENT_CHATS } = require('config/recentChats')
    const configureMockStore: (t: any) => (y: any) => { dispatch: any } =
        require('redux-mock-store').default
    const thunk = require('redux-thunk').default
    /* eslint-enable */

    const mockStore = configureMockStore([thunk])
    const store = mockStore({
        billing: fromJS({ products: [mockedProMonthlyHelpdeskPlan] }),
        currentUser: fromJS({ id: 1 }),
        chats: fromJS({
            tickets: Array(MAX_RECENT_CHATS - 1).fill({
                id: 0,
            }),
        }),
    })

    store.dispatch = jest.fn()

    return { store }
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

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn((flag, defaultValue) => defaultValue),
    getLDClient: jest.fn(() => ({
        variation: jest.fn((flag, defaultValue) => defaultValue),
        waitForInitialization: jest.fn(() => Promise.resolve()),
        on: jest.fn(),
        off: jest.fn(),
        allFlags: jest.fn(() => ({})),
    })),
}))
const variationMock = require('@repo/feature-flags').getLDClient()
    .variation as jest.Mock

describe('receivedEvents', () => {
    beforeEach(() => {
        variationMock.mockImplementation(() => true)
    })

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
        const getAvailablePlansMapSpy = jest.spyOn(
            billingSelectors,
            'getAvailablePlansMap',
        )

        beforeEach(() => {
            jest.useFakeTimers()
            getAvailablePlansMapSpy.mockImplementation(
                () =>
                    ({
                        [mockedProMonthlyHelpdeskPlan.plan_id]:
                            mockedProMonthlyHelpdeskPlan,
                    }) as Record<PlanId, HelpdeskPlan>,
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
                        status: {
                            notification: {
                                message: 'hey',
                            },
                        },
                    },
                } as any)
            }

            expect(typeSafeReduxStore.dispatch).toHaveBeenCalledTimes(2)
            expect(spy).toHaveBeenCalledWith({
                newAccountStatus: 'active',
                currentAccountStatus: 'active',
                notification: { message: 'hey' },
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
                accountUpdatedHandler.onReceive({ account: account } as any)
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
                        data: { auto_assign_to_teams: false },
                    },
                ],
            }

            ;(
                currentAccountSelectors.getTicketAssignmentSettings as jest.MockedFunction<
                    typeof currentAccountSelectors.getTicketAssignmentSettings
                >
            ).mockReturnValue(fromJS({}))

            if (accountUpdatedHandler) {
                accountUpdatedHandler.onReceive({ account: account } as any)
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
                    }),
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
            },
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
                            data: { auto_assign_to_teams: autoAssignToTeams },
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
                    }),
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
            },
        )

        it('should not notify and reload app if new account is preloaded', () => {
            const notifySpy = jest.spyOn(notificationActions, 'notify')
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
                                    mockedProMonthlyHelpdeskPlan.plan_id,
                            },
                        },
                    },
                } as any)
            }

            expect(notifySpy).not.toHaveBeenCalledWith({
                message:
                    'The app will reload automatically in a few seconds to reflect your subscription changes.',
            })
            jest.runAllTimers()
            expect(window.location.reload).not.toHaveBeenCalled()
        })

        it('should not notify and reload app if new account is preloaded - with PlanId-Plan mapping', () => {
            const notifySpy = jest.spyOn(notificationActions, 'notify')
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
                                [ProductType.Helpdesk]:
                                    mockedProMonthlyHelpdeskPlan.plan_id,
                            },
                        },
                    },
                } as any)
            }

            expect(notifySpy).not.toHaveBeenCalledWith({
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
                                    advancedMonthlyHelpdeskPlan.plan_id,
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

        it(
            'should add ticket to recent chats because `shouldTicketBeDisplayedInRecentChats` ' +
                'returned `true`, and not have marked it as read because the current user is not viewing the ticket',
            () => {
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
                    last_message_from_agent: false,
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
                    false,
                    false,
                )
            },
        )

        it(
            'should add ticket to recent chats because `shouldTicketBeDisplayedInRecentChats` ' +
                'returned `true`,  and have marked it as read because the current user is viewing the ticket ',
            () => {
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
                    last_message_from_agent: false,
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
                    false,
                    false,
                )
            },
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
                    typeSafeReduxStore.dispatch,
                )
            },
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
                ticketChatUpdatedHandler.onReceive({ data: ticket } as any)
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
                ticketChatUpdatedHandler.onReceive({ data: ticket } as any)
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
                    typeSafeReduxStore.dispatch,
                )
            },
        )
    })

    describe('FACEBOOK_INTEGRATIONS_RECONNECTED handler', () => {
        const handler = _find(receivedEvents, {
            name: SocketEventType.FacebookIntegrationsReconnected,
        })

        it('should fetch integrations', () => {
            const spy = jest.spyOn(integrationActions, 'fetchIntegrations')
            if (handler) {
                handler.onReceive({ event: { total: 1 } } as any)
            }
            expect(spy).toHaveBeenCalled()
        })

        it('should notify', () => {
            const spy = jest.spyOn(notificationActions, 'notify')

            if (handler) {
                handler.onReceive({ event: { total: 1 } } as any)
            }
            expect(spy).toHaveBeenCalledWith({
                status: 'success',
                message: 'One Facebook page has been reconnected.',
            })

            if (handler) {
                handler.onReceive({ event: { total: 2 } } as any)
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
                handler.onReceive({ event: event } as any)
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
                { entityId: 456, entityType: 'ticket' },
            )
        })
    })

    describe('views-count-updated', () => {
        const handler = _find(receivedEvents, {
            name: 'views-count-updated',
        })

        it('should dispatch the views count', () => {
            if (handler) {
                handler.onReceive({ counts: { '1': 10, '2': 20 } } as any)
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
                sectionCreated(section),
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
                sectionUpdated(section),
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
                sectionDeleted(section.id),
            )
        })
    })

    describe('view-created', () => {
        const handler = _find(receivedEvents, {
            name: 'view-created',
        }) as ReceivedEvent

        it('should dispatch the new view', () => {
            handler.onReceive({ view } as any)
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
            handler.onReceive({ view } as any)
            expect(viewUpdated).toHaveBeenNthCalledWith(1, view)
        })

        it('should dispatch the hidden view', () => {
            ;(
                isViewSharedWithUser as jest.MockedFunction<
                    typeof isViewSharedWithUser
                >
            ).mockImplementationOnce(() => false)
            handler.onReceive({ view } as any)
            expect(viewDeleted).toHaveBeenNthCalledWith(1, view.id)
        })
    })

    describe('view-deleted', () => {
        const handler = _find(receivedEvents, {
            name: 'view-deleted',
        }) as ReceivedEvent

        it('should dispatch the deleted view', () => {
            handler.onReceive({ view } as any)
            expect(viewDeleted).toHaveBeenNthCalledWith(1, view.id)
        })
    })

    describe('ticket-updated', () => {
        const handler = _find(receivedEvents, {
            name: 'ticket-updated',
        }) as ReceivedEvent

        it('should dispatch the updated ticket', () => {
            handler.onReceive({ ticket: { id: 1 } } as any)
            expect(ticketActions.mergeTicket).toHaveBeenNthCalledWith(1, {
                id: 1,
            })
        })

        it('should dispatch the updated chat when is unread', () => {
            handler.onReceive({ ticket: { id: 1, is_unread: true } } as any)
            expect(chatActions.markChatAsUnread).toHaveBeenNthCalledWith(1, 1)
        })

        it('should refetch query when ticket is updated', () => {
            const refetchSpy = jest.spyOn(appQueryClient, 'refetchQueries')

            handler.onReceive({ ticket: { id: 1 } } as any)

            expect(refetchSpy).toHaveBeenCalled()
        })

        it('should call try to invalidate customer query cache', () => {
            handler.onReceive({
                ticket: { id: 1, customer: { id: 123 } },
            } as any)
            expect(throttledUpdateCustomerCache).toHaveBeenCalledWith(123)
        })

        it('should call try to invalidate custom fields query caches', () => {
            handler.onReceive({
                ticket: { id: 1, customer: { id: 123 } },
            } as any)

            expect(throttledUpdateCustomFieldsCache).toHaveBeenCalledWith({
                customerId: 123,
                ticketId: 1,
            })
        })
    })

    describe('ticket-message-created', () => {
        const handler = _find(receivedEvents, {
            name: 'ticket-message-created',
        }) as ReceivedEvent

        const createTicketMessageCreatedEvent = () => {
            const message = ticket.messages[0] as TicketMessage
            return {
                event: {
                    id: 8960833298,
                    type: 'ticket-message-created',
                    object_type: 'TicketMessage',
                    object_id: message.id,
                    context: 'e0c48b5d-7dde-40df-bc85-aaa89c450a80',
                    user_id: message.sender.id,
                    created_datetime: '2026-01-15T21:44:02.260847+00:00',
                },
                ticket,
                message: message,
            } as any
        }

        it('should dispatch the ticket merge action', () => {
            const event = createTicketMessageCreatedEvent()

            handler.onReceive(event)

            expect(ticketActions.mergeTicket).toHaveBeenCalledWith(event.ticket)
        })

        it('should send TicketViewed event when user is on the ticket page', () => {
            ;(
                isCurrentlyOnTicket as jest.MockedFunction<
                    typeof isCurrentlyOnTicket
                >
            ).mockReturnValue(true)

            const mockSend = jest.fn()
            const event = createTicketMessageCreatedEvent()

            handler.onReceive.call({ send: mockSend }, event)

            expect(mockSend).toHaveBeenCalledWith(
                SocketEventType.TicketViewed,
                ticket.id,
            )
        })

        it('should call try to invalidate customer query cache', () => {
            handler.onReceive(createTicketMessageCreatedEvent())
            expect(throttledUpdateCustomerCache).toHaveBeenCalledWith(
                ticket.customer?.id,
            )
        })
    })

    describe('agent-availability-updated', () => {
        const handler = _find(receivedEvents, {
            name: SocketEventType.AgentAvailabilityUpdated,
        }) as ReceivedEvent

        it('should dispatch the availability status', () => {
            handler.onReceive({
                event: { type: SocketEventType.AgentAvailabilityUpdated },
                data: { user_id: 1, available: true },
            })

            expect(currentUserActions.setIsAvailable).toHaveBeenNthCalledWith(
                1,
                true,
            )
            expect(chatActions.fetchChatsThrottled).toHaveBeenCalled()
        })
    })

    describe('customer-updated', () => {
        const handler = _find(receivedEvents, {
            name: 'customer-updated',
        }) as ReceivedEvent

        it('should dispatch mergeCustomer action and call throttledUpdateCustomerCache with customer id', () => {
            const customer = {
                id: 456,
                name: 'John Doe',
                email: 'john@example.com',
            }

            handler.onReceive({
                event: { type: 'customer-updated' },
                customer,
            })

            expect(ticketActions.mergeCustomer).toHaveBeenCalledWith(customer)
            expect(throttledUpdateCustomerCache).toHaveBeenCalledWith(
                customer.id,
            )
        })

        it('should not call throttledUpdateCustomerCache when customer has no id', () => {
            handler.onReceive({
                event: { type: 'customer-updated' },
                customer: { name: 'No ID Customer', email: 'noid@example.com' },
            })

            expect(ticketActions.mergeCustomer).toHaveBeenCalledWith({
                name: 'No ID Customer',
                email: 'noid@example.com',
            })
            expect(throttledUpdateCustomerCache).not.toHaveBeenCalled()
        })

        it('should not call throttledUpdateCustomerCache when customer id is falsy', () => {
            handler.onReceive({
                event: { type: 'customer-updated' },
                customer: { id: 0, name: 'Zero ID' },
            })

            expect(ticketActions.mergeCustomer).toHaveBeenCalledWith({
                id: 0,
                name: 'Zero ID',
            })
            expect(throttledUpdateCustomerCache).not.toHaveBeenCalled()
        })

        it('should not break on non-customer / incorrect event data', () => {
            handler.onReceive({
                event: { type: 'customer-updated' },
                customer: undefined as any,
            })

            expect(throttledUpdateCustomerCache).not.toHaveBeenCalled()
        })
    })

    describe(SocketEventType.CustomerExternalDataUpdated, () => {
        const handler = _find(receivedEvents, {
            name: SocketEventType.CustomerExternalDataUpdated,
        }) as ReceivedEvent

        it('should dispatch the updated external data for customer id', () => {
            const customerExternalDataUpdatedEvent = {
                event: { type: SocketEventType.CustomerExternalDataUpdated },
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
                customerExternalDataUpdatedEvent.external_data,
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
                ticket: { id: 100 },
            })

            expect(ticketActions.setTypingActivityShopper).toHaveBeenCalledWith(
                100,
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
                'onVerifyMigrationForwarding',
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
                migration.integration.meta.address,
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
                'onVerifyMigrationForwardingFailure',
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
                migration.integration.meta.address,
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

            appQueryClient.setQueryData(queryKey, { data: [{ id: 2 }] })

            handler.onReceive({
                event: {
                    type: SocketEventType.VoiceCallCreated,
                },
                voice_call: voiceCall,
            })
            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: [{ id: 2 }, voiceCall],
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
                data: [{ id: 1 }, { id: 2 }],
            })

            handler.onReceive({
                event: {
                    type: SocketEventType.VoiceCallUpdated,
                },
                voice_call: voiceCall,
            })
            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: [voiceCall, { id: 2 }],
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
                data: [{ id: 1 }, { id: 2 }],
            })

            handler.onReceive({
                event: {
                    type: SocketEventType.VoiceCallUpdated,
                },
                voice_call: voiceCall,
            })
            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: [{ id: 1 }, { id: 2 }],
            })
        })
    })

    describe('voice-call-recording-updated', () => {
        it('should refetch query when the transcription status is provided', () => {
            const handler = _find(receivedEvents, {
                name: SocketEventType.VoiceCallRecordingUpdated,
            }) as ReceivedEvent

            const refetchSpy = jest.spyOn(appQueryClient, 'refetchQueries')

            const voiceCallId = 1
            const queryKey = voiceCallsKeys.listRecordings({
                call_id: voiceCallId,
            })

            handler.onReceive({
                event: {
                    type: SocketEventType.VoiceCallRecordingUpdated,
                    voice_call_id: voiceCallId,
                    ticket_id: 123,
                },
                voice_call_recording: {
                    id: 12345,
                    call_id: voiceCallId,
                    transcription_status: 'completed',
                },
            })

            expect(refetchSpy).toHaveBeenCalledWith(queryKey)
        })

        it('should not refetch query when the transcription status is not provided', () => {
            const handler = _find(receivedEvents, {
                name: SocketEventType.VoiceCallRecordingUpdated,
            }) as ReceivedEvent

            const refetchSpy = jest.spyOn(appQueryClient, 'refetchQueries')

            const voiceCallId = 1
            handler.onReceive({
                event: {
                    type: SocketEventType.VoiceCallRecordingUpdated,
                    voice_call_id: voiceCallId,
                    ticket_id: 123,
                },
                voice_call_recording: {
                    id: 12345,
                    call_id: voiceCallId,
                },
            })
            expect(refetchSpy).not.toHaveBeenCalled()
        })
    })

    describe('Shopper events', () => {
        it.each([
            SocketEventType.ShopperCreated,
            SocketEventType.ShopperUpdated,
        ])('should dispatch the shopper data for customer id', (eventType) => {
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
            expect(mergeCustomerEcommerceDataShopper).toHaveBeenCalledTimes(1)
        })
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
                    mergeCustomerEcommerceDataShopperAddress,
                ).toHaveBeenCalledTimes(1)
            },
        )
    })

    describe('Ecommerce order events', () => {
        it.each([SocketEventType.OrderCreated, SocketEventType.OrderUpdated])(
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
                expect(mergeCustomerEcommerceDataOrder).toHaveBeenCalledTimes(1)
            },
        )
    })
})
