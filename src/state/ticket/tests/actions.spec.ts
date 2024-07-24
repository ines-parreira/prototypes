import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import moment from 'moment'
import MockAdapter from 'axios-mock-adapter'
import thunk from 'redux-thunk'
import {fromJS, Map} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'
import {dismissNotification} from 'reapop'

import {agents} from 'fixtures/agents'
import {teams} from 'fixtures/teams'
import {notify} from 'state/notifications/actions'
import {initialState as newMessageState} from 'state/newMessage/reducers'
import {Event, EventObjectType, TICKET_EVENT_TYPES} from 'models/event/types'
import {StoreDispatch} from 'state/types'
import {Ticket, TicketMessage} from 'models/ticket/types'
import socketManager from 'services/socketManager/socketManager'
import {
    TicketMessageFailedEvent,
    SocketEventType,
} from 'services/socketManager/types'
import history from 'pages/history'
import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {ViewType} from 'models/view/types'
import {getLDClient} from 'utils/launchDarkly'

import {
    ecommerceStoreFixture,
    shopperAddressFixture,
    shopperFixture,
    shopperOrderFixture,
} from 'models/customerEcommerceData/fixtures'
import {
    MERGE_CUSTOMER_ECOMMERCE_DATA_ORDER,
    MERGE_CUSTOMER_ECOMMERCE_DATA_SHOPPER,
    MERGE_CUSTOMER_ECOMMERCE_DATA_SHOPPER_ADDRESS,
} from 'state/ticket/constants'
import {initialState} from '../reducers'
import * as actions from '../actions'

type MockedRootState = {
    ticket: Map<any, any>
    newMessage?: Map<any, any>
    currentUser?: Map<any, any>
    views?: Map<any, any>
}

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares
)

jest.mock('reapop', () => {
    const reapop: Record<string, unknown> = jest.requireActual('reapop')
    return {
        ...reapop,
        dismissNotification: jest.fn(() => (args: unknown) => args),
    }
})
jest.mock('push.js', () => {
    return {
        create: jest.fn(),
    }
})

jest.mock('utils', () => {
    const utils = jest.requireActual('utils')

    return {
        ...utils,
        isTabActive: jest.fn(() => false),
        isCurrentlyOnTicket: jest.fn((ticketId: string) => ticketId === '1'),
    } as {
        isTabActive: jest.MockedFunction<typeof utils.isTabActive>
        isCurrentlyOnTicket: jest.MockedFunction<
            typeof utils.isCurrentlyOnTicket
        >
    }
})

jest.mock('services/socketManager/socketManager', () => {
    return {
        join: jest.fn(),
        send: jest.fn(),
    }
})

jest.mock('state/notifications/actions', () => {
    return {
        notify: jest.fn(() => (args: Record<string, unknown>) => args),
    }
})
jest.mock('pages/history')

jest.mock('utils/launchDarkly')
const variationMock = getLDClient().variation as jest.Mock

describe('ticket actions', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        expect.extend(immutableMatchers)
        store = mockStore({
            ticket: initialState,
            newMessage: newMessageState,
        })
        mockServer = new MockAdapter(client)
        variationMock.mockImplementation(() => true)
    })

    const endpointMatchers = {
        anyTicket: new RegExp('/api/tickets/\\d+'),
        ticket1: new RegExp('/api/tickets/1'),
        ticket2: new RegExp('/api/tickets/2'),
    }

    const ticket = {
        id: 1,
        subject: 'title',
        messages: [
            {
                id: 1,
                body_text: 'hello',
                body_html: '<div>hello</div>',
                channel: 'email',
            },
        ],
        customer: {
            id: 1,
            data: {hello: 'world!'},
        },
    } as unknown as Ticket

    describe('mergeTicket()', () => {
        it('fails because not current ticket', () => {
            return store
                .dispatch(actions.mergeTicket(ticket))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('success', () => {
            store = mockStore({
                ticket: fromJS({
                    id: 1,
                    messages: [],
                }),
                newMessage: newMessageState.setIn(
                    ['newMessage', 'source', 'type'],
                    undefined
                ),
            })

            return store
                .dispatch(actions.mergeTicket(ticket))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    it('mergeCustomer()', () => {
        store.dispatch(actions.mergeCustomer({id: 1} as any))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('mergeCustomerExternalData()', () => {
        store.dispatch(
            actions.mergeCustomerExternalData(1, {
                'my-awesome-app-id-1': {
                    badge: 'Best customer',
                    __app_name__: 'foo',
                },
            })
        )
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('mergeCustomerEcommerceDataShopper()', () => {
        store.dispatch(
            actions.mergeCustomerEcommerceDataShopper(
                1,
                ecommerceStoreFixture,
                shopperFixture
            )
        )
        expect(store.getActions()).toMatchObject([
            {
                type: MERGE_CUSTOMER_ECOMMERCE_DATA_SHOPPER,
                customerId: 1,
                store: ecommerceStoreFixture,
                shopper: shopperFixture,
            },
        ])
    })

    it('mergeCustomerEcommerceDataShopperAddress()', () => {
        store.dispatch(
            actions.mergeCustomerEcommerceDataShopperAddress(
                1,
                ecommerceStoreFixture.uuid,
                shopperAddressFixture
            )
        )
        expect(store.getActions()).toMatchObject([
            {
                type: MERGE_CUSTOMER_ECOMMERCE_DATA_SHOPPER_ADDRESS,
                customerId: 1,
                storeUUID: ecommerceStoreFixture.uuid,
                shopperAddress: shopperAddressFixture,
            },
        ])
    })

    it('mergeCustomerEcommerceDataOrder()', () => {
        store.dispatch(
            actions.mergeCustomerEcommerceDataOrder(
                1,
                ecommerceStoreFixture.uuid,
                shopperOrderFixture
            )
        )
        expect(store.getActions()).toMatchObject([
            {
                type: MERGE_CUSTOMER_ECOMMERCE_DATA_ORDER,
                customerId: 1,
                storeUUID: ecommerceStoreFixture.uuid,
                shopperOrder: shopperOrderFixture,
            },
        ])
    })

    describe('ticketPartialUpdate()', () => {
        const update = {subject: 'new title'}

        it('fails because new ticket', () => {
            return store
                .dispatch(actions.ticketPartialUpdate(update))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should format custom fields correctly', () => {
            mockServer
                .onPut(endpointMatchers.ticket1)
                .reply(200, {data: {id: 1}})

            store = mockStore({
                ticket: fromJS({
                    id: 1,
                }),
            })

            const customFields = {
                1: {
                    id: 1,
                    value: 'hello',
                },
            }

            return store
                .dispatch(
                    actions.ticketPartialUpdate({
                        custom_fields: customFields,
                    })
                )
                .then(() =>
                    expect(mockServer.history.put[0].data).toEqual(
                        JSON.stringify({
                            custom_fields: [customFields[1]],
                        })
                    )
                )
        })

        it('success', () => {
            mockServer
                .onPut(endpointMatchers.ticket1)
                .reply(200, {data: {id: 1}})

            store = mockStore({
                ticket: fromJS({id: 1}),
            })

            return store
                .dispatch(actions.ticketPartialUpdate(update))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should update a ticket with the passed id instead of the current one', () => {
            mockServer
                .onPut(endpointMatchers.ticket2)
                .reply(200, {data: {id: 2}})

            store = mockStore({
                ticket: fromJS({id: 1}),
            })

            return store
                .dispatch(actions.ticketPartialUpdate(update, 2))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    it('addTags()', () => {
        mockServer.onPut(endpointMatchers.anyTicket).reply(202, {data: {}})
        return store
            .dispatch(actions.addTags('refund, billing'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('removeTag()', () => {
        mockServer.onPut(endpointMatchers.anyTicket).reply(202, {data: {}})
        return store
            .dispatch(actions.removeTag('refund'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    describe('setSpam()', () => {
        it('fails because same status', () => {
            store = mockStore({
                ticket: initialState.set('spam', true),
            })
            return store
                .dispatch(actions.setSpam(true))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('success', () => {
            store = mockStore({
                ticket: initialState.set('id', 1),
            })
            mockServer.onPut(endpointMatchers.anyTicket).reply(202, {data: {}})
            return store
                .dispatch(actions.setSpam(true))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should undo when clicking on notification button', () => {
            store = mockStore({
                ticket: initialState.set('id', 1),
            })
            mockServer.onPut(endpointMatchers.anyTicket).reply(202, {data: {}})

            return store.dispatch(actions.setSpam(true)).then(() => {
                const button = (notify as jest.MockedFunction<typeof notify>)
                    .mock.calls[0][0]!.buttons?.[0] as unknown as {
                    onClick: () => Promise<void>
                }

                if (!button) {
                    throw new Error('property buttons is undefined')
                }
                return button.onClick().then(() => {
                    expect(dismissNotification).toHaveBeenNthCalledWith(
                        1,
                        'spam-1'
                    )
                    expect(store.getActions()).toMatchSnapshot()
                })
            })
        })
    })

    describe('setTrashed()', () => {
        it('should dispatch actions (trash ticket)', () => {
            const date = moment('2017-08-11')
            store = mockStore({ticket: initialState.set('id', 1)})
            mockServer.onPut(endpointMatchers.anyTicket).reply(202, {data: {}})

            return store.dispatch(actions.setTrashed(date)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
            })
        })

        it('should dispatch actions (untrash ticket)', () => {
            store = mockStore({
                ticket: initialState
                    .set('id', 1)
                    .set('trashed_datetime', moment.utc()),
            })
            mockServer.onPut(endpointMatchers.anyTicket).reply(202, {data: {}})

            return store.dispatch(actions.setTrashed(null)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
            })
        })

        it('should not dispatch actions (same status)', () => {
            store = mockStore({
                ticket: initialState.set('trashed_datetime', moment.utc()),
            })

            return store.dispatch(actions.setTrashed(moment.utc())).then(() => {
                expect(store.getActions()).toEqual([])
            })
        })

        it('should undo when clicking on notification button', () => {
            const date = moment('2017-08-11')
            store = mockStore({ticket: initialState.set('id', 1)})
            mockServer.onPut(endpointMatchers.anyTicket).reply(202, {data: {}})

            return store.dispatch(actions.setTrashed(date)).then(() => {
                const button = (notify as jest.MockedFunction<typeof notify>)
                    .mock.calls[0][0]!.buttons?.[0] as unknown as {
                    onClick: () => Promise<void>
                }

                if (!button) {
                    throw new Error('property buttons is undefined')
                }
                return button.onClick().then(() => {
                    expect(dismissNotification).toHaveBeenNthCalledWith(
                        1,
                        'trash-1'
                    )
                    expect(store.getActions()).toMatchSnapshot()
                })
            })
        })
    })

    describe('snoozeTicket()', () => {
        it('should snooze ticket', () => {
            store = mockStore({
                ticket: initialState.set('snooze_datetime', null),
            })

            return store
                .dispatch(actions.snoozeTicket(moment('2017-12-21')))
                .then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                })
        })

        it('should snooze ticket and call the callback', () => {
            const callbackSpy = jest.fn()
            store = mockStore({
                ticket: initialState.set('snooze_datetime', null),
            })

            return store
                .dispatch(
                    actions.snoozeTicket(moment('2017-12-21'), callbackSpy)
                )
                .then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    expect(callbackSpy).toHaveBeenCalled()
                })
        })
    })

    it('setAgent()', () => {
        mockServer.onPut(endpointMatchers.anyTicket).reply(202, {data: {}})
        return store
            .dispatch(
                actions.setAgent({
                    id: agents[0].id,
                    name: agents[0].name,
                    email: agents[0].email,
                    meta: {},
                })
            )
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setTeam()', () => {
        mockServer.onPut(endpointMatchers.anyTicket).reply(202, {data: {}})
        return store
            .dispatch(
                actions.setTeam({
                    id: teams[0].id,
                    name: teams[0].name,
                })
            )
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setCustomer()', () => {
        mockServer.onPut(endpointMatchers.anyTicket).reply(202, {data: {}})
        return store
            .dispatch(actions.setCustomer(fromJS({id: 1, custom: true})))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setStatus()', () => {
        mockServer.onPut(endpointMatchers.anyTicket).reply(202, {data: {}})
        return store
            .dispatch(actions.setStatus('open'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setSubject()', () => {
        mockServer.onPut(endpointMatchers.anyTicket).reply(202, {data: {}})
        return store
            .dispatch(actions.setSubject('new title'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('deleteMessage()', () => {
        mockServer.onDelete('/api/tickets/1/messages/10/').reply(200)
        return store
            .dispatch(actions.deleteMessage(1, 10))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('deleteActionOnApplied()', () => {
        store.dispatch(actions.deleteActionOnApplied(0, 1))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('updateActionArgsOnApplied()', () => {
        store.dispatch(
            actions.updateActionArgsOnApplied(0, fromJS({name: 'hello'}), 1)
        )
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('applyMacroAction()', () => {
        const action = fromJS({
            type: 'user',
            name: 'setResponseText',
            arguments: {
                contentState: {},
                selectionState: {},
            },
        })

        store = mockStore({ticket: initialState.set('id', 1)})
        return expect(
            store.dispatch(actions.applyMacroAction(action))
        ).toMatchSnapshot()
    })

    it('applyMacro()', () => {
        const macro = fromJS({
            id: 1,
            actions: [
                {
                    type: 'user',
                    name: 'setResponseText',
                    arguments: {
                        contentState: {},
                        selectionState: {},
                    },
                },
                {
                    type: 'user',
                    name: 'addTags',
                    arguments: {
                        tags: 'refund, billing',
                    },
                },
            ],
        })

        store = mockStore({
            ticket: initialState.set('id', 1),
            currentUser: fromJS({id: 1}),
        })
        return store
            .dispatch(actions.applyMacro(macro, 1))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('clearAppliedMacro()', () => {
        store.dispatch(actions.clearAppliedMacro(1))
        return expect(store.getActions()).toMatchSnapshot()
    })

    describe('fetchTicket()', () => {
        it('new ticket', () => {
            return store
                .dispatch(actions.fetchTicket('new'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('existing ticket', () => {
            mockServer
                .onGet(endpointMatchers.ticket1)
                .reply(200, {id: 1, messages: [], events: []})
            store = mockStore({
                newMessage: newMessageState,
                ticket: initialState.set('id', 1),
                currentUser: fromJS({id: 1}),
            })
            return store
                .dispatch(actions.fetchTicket('1', {isCurrentlyOnTicket: true}))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('existing instagram ticket', () => {
            mockServer.onGet(endpointMatchers.ticket1).reply(200, {
                id: 1,
                messages: [{source: {type: 'instagram-comment'}}],
                events: [],
            })
            store = mockStore({
                newMessage: newMessageState,
                ticket: initialState.set('id', 1),
                currentUser: fromJS({id: 1}),
            })
            return store
                .dispatch(actions.fetchTicket('1', {isCurrentlyOnTicket: true}))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should not dispatch new message when existing new message', () => {
            mockServer.onGet(endpointMatchers.ticket1).reply(200, {
                id: 1,
                messages: [{source: {type: 'instagram-comment'}}],
                events: [],
            })
            store = mockStore({
                newMessage: newMessageState.mergeDeep({
                    newMessage: {
                        body_text: 'foo',
                    },
                }),
                ticket: initialState.set('id', 1),
                currentUser: fromJS({id: 1}),
            })
            return store
                .dispatch(actions.fetchTicket('1'))
                .then(() =>
                    expect(
                        store
                            .getActions()
                            .find(
                                (action: {type: string}) =>
                                    action.type ===
                                    'NEW_MESSAGE_FETCH_TICKET_SUCCESS'
                            )
                    ).toBeUndefined()
                )
        })

        it('should send ticket-viewed event when ticket is unread', () => {
            mockServer
                .onGet(endpointMatchers.ticket1)
                .reply(200, {id: 1, messages: [], is_unread: true, events: []})
            store = mockStore({
                newMessage: newMessageState,
                ticket: initialState.set('id', 1),
                currentUser: fromJS({id: 1}),
            })
            return store
                .dispatch(actions.fetchTicket('1', {isCurrentlyOnTicket: true}))
                .then(() => {
                    expect(socketManager.send).toHaveBeenCalledWith(
                        SocketEventType.TicketViewed,
                        1
                    )
                    expect(store.getActions()).toMatchSnapshot()
                })
        })

        it('should not send ticket-viewed event when ticket is read', () => {
            mockServer
                .onGet(endpointMatchers.ticket1)
                .reply(200, {id: 1, messages: [], is_unread: false, events: []})
            store = mockStore({
                newMessage: newMessageState,
                ticket: initialState.set('id', 1),
                currentUser: fromJS({id: 1}),
            })
            return store
                .dispatch(actions.fetchTicket('1'))
                .then(() => expect(socketManager.send).not.toHaveBeenCalled())
        })

        describe('should correctly handle redirects for merged tickets', () => {
            beforeEach(() => {
                mockServer.onGet(endpointMatchers.anyTicket).reply(200, {
                    id: 2,
                    uri: '/api/tickets/2/',
                    messages: [],
                })
            })

            it('should redirect to the merged ticket if the current URL is of the old (merged) ticket', () => {
                return store
                    .dispatch(
                        actions.fetchTicket('1', {isCurrentlyOnTicket: true})
                    )
                    .finally(() => {
                        expect(history.push).toHaveBeenCalledWith(
                            '/app/ticket/2'
                        )
                    })
            })

            it('should NOT redirect if the current URL is NOT of the merged ticket', () => {
                return store.dispatch(actions.fetchTicket('99')).finally(() => {
                    expect(history.push).not.toHaveBeenCalledWith(
                        '/app/ticket/2'
                    )
                })
            })
        })
    })

    describe('handleMessageError()', () => {
        it('should fetch the ticket because the user is currently on it and reopen the ticket', (done) => {
            mockServer
                .onGet(endpointMatchers.ticket1)
                .reply(200, {id: 1, messages: [], events: []})
            mockServer
                .onPut(endpointMatchers.ticket1)
                .reply(200, {id: 1, messages: [], events: []})
            const json = {
                ticket_id: '1',
                event: {
                    data: {
                        error: {
                            message: 'test handling message error',
                        },
                    },
                },
            } as unknown as TicketMessageFailedEvent

            void store.dispatch(actions.handleMessageError(json))
            setImmediate(() => {
                expect(store.getActions()).toMatchSnapshot()
                done()
            })
        })

        it('should not fetch the ticket because the user is not currently on it and reopen the ticket', (done) => {
            mockServer
                .onPut(endpointMatchers.ticket2)
                .reply(200, {id: 2, messages: []})

            const json = {
                ticket_id: 2,
                event: {
                    data: {
                        error: {
                            message: 'test handling message error',
                        },
                    },
                },
            } as unknown as TicketMessageFailedEvent

            void store.dispatch(actions.handleMessageError(json))
            setImmediate(() => {
                expect(store.getActions()).toMatchSnapshot()
                done()
            })
        })
    })

    describe('handleMessageActionError()', () => {
        it('should fetch the ticket because the user is currently on it', () => {
            mockServer
                .onGet(endpointMatchers.ticket1)
                .reply(200, {id: 1, messages: [], events: []})

            return store
                .dispatch(actions.handleMessageActionError('1'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should not fetch the ticket because the user is not currently on it', () => {
            mockServer
                .onGet(endpointMatchers.ticket2)
                .reply(200, {id: 2, messages: [], events: []})

            return store
                .dispatch(actions.handleMessageActionError('2'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    it('updateTicketMessage()', () => {
        mockServer
            .onPut('/api/tickets/1/messages/10/?action=retry')
            .reply(200, {id: 10})
        return store
            .dispatch(
                actions.updateTicketMessage(
                    '1',
                    10,
                    {id: 10} as TicketMessage,
                    'retry'
                )
            )
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('clearTicket()', () => {
        store.dispatch(actions.clearTicket())
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('toggleHistory()', () => {
        expect(actions.toggleHistory(true)).toMatchSnapshot()
        expect(actions.toggleHistory(false)).toMatchSnapshot()
    })

    it('displayHistoryOnNextPage()', () => {
        expect(actions.displayHistoryOnNextPage(true)).toMatchSnapshot()
        expect(actions.displayHistoryOnNextPage(false)).toMatchSnapshot()
        expect(actions.displayHistoryOnNextPage()).toMatchSnapshot()
    })

    it('deleteTicket()', () => {
        mockServer.onDelete('/api/tickets/13/').reply(200)
        return store
            .dispatch(actions.deleteTicket(13))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('deleteTicketPendingMessage()', () => {
        store.dispatch(actions.deleteTicketPendingMessage({id: 1} as any))
        return expect(store.getActions()).toMatchSnapshot()
    })

    describe('goToNextTicket()', () => {
        const defaultActiveView = {order_by: 'created_datetime'}
        it('should go to first view because there is no active view', (done) => {
            void store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app')
                done()
            })
        })

        it('should go to first view because active view is a customer view', (done) => {
            store = mockStore({
                ticket: initialState,
                views: fromJS({
                    active: {
                        ...defaultActiveView,
                        id: 1,
                        type: ViewType.CustomerList,
                    },
                }),
            })
            void store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app')
                done()
            })
        })

        it('should go to first view because active view is not ordered', (done) => {
            store = mockStore({
                ticket: initialState,
                views: fromJS({
                    active: {
                        id: 1,
                    },
                }),
            })

            void store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(history.push).toHaveBeenCalledWith('/app')
                done()
            })
        })

        it('should not check for view ordering if FF is disabled', (done) => {
            variationMock.mockImplementation(() => false)
            store = mockStore({
                ticket: initialState,
                views: fromJS({
                    active: {
                        id: 1,
                    },
                }),
            })

            void store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(history.push).not.toHaveBeenCalled()
                done()
            })
        })

        it('should fetch next ticket and go to the active view because there is no ticket', (done) => {
            mockServer.onPut('/api/views/1/tickets/1/next').reply(200)
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {...defaultActiveView, id: 1}}),
            })

            void store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app/tickets/1')
                done()
            })
        })

        it('should fetch next ticket and go to the search because there is no ticket', (done) => {
            mockServer.onPut('/api/views/0/tickets/1/next').reply(200)
            store = mockStore({
                ticket: initialState,
                views: fromJS({
                    active: {...defaultActiveView, search: 'foo'},
                }),
            })

            void store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith({
                    pathname: '/app/tickets/search',
                    query: {q: 'foo'},
                })
                done()
            })
        })

        it('should fetch next ticket and go to this ticket', (done) => {
            const ticket = {id: 2, customerId: 1, messages: [], events: []}
            mockServer.onPut('/api/views/1/tickets/1/next').reply(200, ticket)
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {...defaultActiveView, id: 1}}),
            })

            const fetchTicketPromise = store.dispatch(actions.goToNextTicket(1))

            expect(store.getActions()).not.toEqual([])

            void fetchTicketPromise.then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app/ticket/2')
                done()
            })
        })

        it(
            'should fetch next ticket and go to this ticket, and prepare new message correctly as the ticket is an ' +
                'instagram ticket',
            (done) => {
                const ticket = {
                    id: 2,
                    customerId: 1,
                    messages: [{source: {type: 'instagram-comment'}}],
                    events: [],
                }
                mockServer
                    .onPut('/api/views/1/tickets/1/next')
                    .reply(200, ticket)
                store = mockStore({
                    ticket: initialState,
                    views: fromJS({active: {...defaultActiveView, id: 1}}),
                })

                const fetchTicketPromise = store.dispatch(
                    actions.goToNextTicket(1)
                )

                void fetchTicketPromise.then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    expect(history.push).toHaveBeenCalledWith('/app/ticket/2')
                    done()
                })
            }
        )

        it('should fetch next ticket and wait for promise to be resolved to go to this ticket', (done) => {
            mockServer
                .onPut('/api/views/1/tickets/1/next')
                .reply(200, {id: 2, messages: [], events: []})
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {...defaultActiveView, id: 1}}),
            })

            const promise = Promise.resolve()
            const fetchTicketPromise = store.dispatch(
                actions.goToNextTicket(1, promise)
            )

            void fetchTicketPromise.then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app/ticket/2')
                done()
            })
        })

        it('should send ticket-viewed event when ticket is unread', () => {
            mockServer.onPut('/api/views/1/tickets/1/next').reply(200, {
                id: 2,
                customerId: 1,
                messages: [],
                is_unread: true,
                events: [],
            })
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {...defaultActiveView, id: 1}}),
            })

            return store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(socketManager.send).toHaveBeenCalledWith(
                    SocketEventType.TicketViewed,
                    2
                )
            })
        })

        it('should not send ticket-viewed event when ticket is read', () => {
            mockServer.onPut('/api/views/1/tickets/1/next').reply(200, {
                id: 2,
                customerId: 1,
                messages: [],
                is_unread: false,
                events: [],
            })
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {...defaultActiveView, id: 1}}),
            })

            return store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(socketManager.send).not.toHaveBeenCalled()
            })
        })
    })

    describe('goToPrevTicket()', () => {
        const defaultActiveView = {order_by: 'created_datetime'}

        it('should go to first view because there is no active view', (done) => {
            void store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app')
                done()
            })
        })

        it('should go to first view because active view is not ordered', (done) => {
            store = mockStore({
                ticket: initialState,
                views: fromJS({
                    active: {
                        id: 1,
                    },
                }),
            })

            void store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(history.push).toHaveBeenCalledWith('/app')
                done()
            })
        })

        it('should fetch previous ticket and go to the active view because there is no ticket', (done) => {
            mockServer.onPut('/api/views/1/tickets/2/prev').reply(200)
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {...defaultActiveView, id: 1}}),
            })

            void store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app/tickets/1')
                done()
            })
        })

        it('should fetch previous ticket and go to the search because there is no ticket', (done) => {
            mockServer.onPut('/api/views/0/tickets/2/prev').reply(200)
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {...defaultActiveView, search: 'foo'}}),
            })

            void store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith({
                    pathname: '/app/tickets/search',
                    query: {q: 'foo'},
                })
                done()
            })
        })

        it('should fetch previous ticket and go to this ticket', (done) => {
            const ticket = {id: 1, customerId: 1, messages: [], events: []}
            mockServer.onPut('/api/views/1/tickets/2/prev').reply(200, ticket)
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {...defaultActiveView, id: 1}}),
            })

            const fetchTicketPromise = store.dispatch(actions.goToPrevTicket(2))

            expect(store.getActions()).not.toEqual([])

            void fetchTicketPromise.then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app/ticket/1')
                done()
            })
        })

        it(
            'should fetch previous ticket and go to this ticket, and prepare new message correctly as the ticket is ' +
                'an instagram ticket',
            (done) => {
                const ticket = {
                    id: 1,
                    customerId: 1,
                    messages: [{source: {type: 'instagram-comment'}}],
                    events: [],
                }
                mockServer
                    .onPut('/api/views/1/tickets/2/prev')
                    .reply(200, ticket)
                store = mockStore({
                    ticket: initialState,
                    views: fromJS({active: {...defaultActiveView, id: 1}}),
                })

                const fetchTicketPromise = store.dispatch(
                    actions.goToPrevTicket(2)
                )

                expect(store.getActions()).not.toEqual([])

                void fetchTicketPromise.then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    expect(history.push).toHaveBeenCalledWith('/app/ticket/1')
                    done()
                })
            }
        )

        it('should fetch previous ticket and wait for promise to be resolved to go to this ticket', (done) => {
            mockServer
                .onPut('/api/views/1/tickets/2/prev')
                .reply(200, {id: 1, messages: [], events: []})
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {...defaultActiveView, id: 1}}),
            })

            const promise = Promise.resolve()
            const fetchTicketPromise = store.dispatch(
                actions.goToPrevTicket(2, promise)
            )

            expect(store.getActions()).toEqual([])

            void fetchTicketPromise.then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app/ticket/1')
                done()
            })
        })

        it('should send ticket-viewed event when ticket is unread', () => {
            mockServer.onPut('/api/views/1/tickets/2/prev').reply(200, {
                id: 2,
                customerId: 1,
                messages: [],
                is_unread: true,
                events: [],
            })
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {...defaultActiveView, id: 1}}),
            })

            return store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(socketManager.send).toHaveBeenCalledWith(
                    SocketEventType.TicketViewed,
                    2
                )
            })
        })

        it('should not send ticket-viewed event when ticket is read', () => {
            mockServer.onPut('/api/views/1/tickets/2/prev').reply(200, {
                id: 2,
                customerId: 1,
                messages: [],
                is_unread: false,
                events: [],
            })
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}}),
            })

            return store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(socketManager.send).not.toHaveBeenCalled()
            })
        })
    })

    describe('findAndSetCustomer()', () => {
        it('should not set the customer because we did not find any customer with this id', async () => {
            mockServer.onGet('/api/customers/1').reply(404, {message: 'error'})
            store = mockStore({
                ticket: initialState,
            })

            return store.dispatch(actions.findAndSetCustomer(1)).then(() => {
                expect(store.getActions()).toEqual([])
            })
        })

        it('should set the customer because there is a customer matching this id', async () => {
            mockServer.onGet('/api/customers/1').reply(200, {
                data: {id: 1, name: 'foo', email: 'foo@gorgias.io'},
            })
            store = mockStore({
                ticket: initialState,
            })

            return store.dispatch(actions.findAndSetCustomer(1)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
            })
        })
    })

    describe('displayAuditLogEvents()', () => {
        let mockServerGorgiasApi: MockAdapter
        const getEvent = (id: number): Event => ({
            id,
            user_id: 1,
            object_type: EventObjectType.Ticket,
            object_id: 1,
            data: null,
            context: 'foo',
            type: TICKET_EVENT_TYPES.TicketReopened,
            created_datetime: '2019-11-15 19:00:00.000000',
            uri: '/api/events/3265847/',
        })

        beforeEach(() => {
            mockServerGorgiasApi = new MockAdapter(client)
        })

        it('should dispatch audit logs events, page per page', async () => {
            const ticketId = 123
            const path = `/api/events/`
            const matcher = new RegExp(path + '*')

            const mocks: ApiListResponseCursorPagination<Event[]>[] = [
                {
                    data: [getEvent(1), getEvent(2), getEvent(3)],
                    meta: {
                        next_cursor: 'cursored_page_2',
                        prev_cursor: null,
                    },
                    object: 'list',
                    uri: 'api/events',
                },
                {
                    data: [getEvent(4), getEvent(5), getEvent(6)],
                    meta: {
                        next_cursor: 'cursored_page_3',
                        prev_cursor: 'cursored_page_1',
                    },
                    object: 'list',
                    uri: 'api/events',
                },
                {
                    data: [getEvent(7), getEvent(8), getEvent(9)],
                    meta: {
                        next_cursor: null,
                        prev_cursor: 'cursored_page_2',
                    },
                    object: 'list',
                    uri: 'api/events',
                },
            ]

            mockServerGorgiasApi
                .onGet(matcher)
                .replyOnce(200, mocks[0])
                .onGet(matcher)
                .replyOnce(200, mocks[1])
                .onGet(matcher)
                .replyOnce(200, mocks[2])

            await store.dispatch(actions.displayAuditLogEvents(ticketId))
            expect(store.getActions()).toMatchSnapshot()
        })

        it('should dispatch a notification because there is no event for the given ticket', async () => {
            const ticketId = 123
            const path = `/api/events/`

            mockServerGorgiasApi.onGet(path).reply(200, {
                data: [],
                meta: {next_cursor: null, prev_cursor: null},
            })

            await store.dispatch(actions.displayAuditLogEvents(ticketId))

            expect(notify).toBeCalledWith({
                status: 'info',
                message: 'No event for this ticket',
            })
        })
    })

    describe('hideAuditLogEvents()', () => {
        it('should dispatch REMOVE_TICKET_AUDIT_LOG_EVENTS action', () => {
            store.dispatch(actions.hideAuditLogEvents())
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('messageDeleted()', () => {
        it('should dispatch TICKET_MESSAGE_DELETED action', () => {
            store.dispatch(actions.messageDeleted('123' as any))
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('setTypingActivityShopper()', () => {
        it('should dispatch SET_TYPING_ACTIVITY_SHOPPER action', () => {
            const mockTimeoutSpy = jest.spyOn(window, 'setTimeout')
            mockTimeoutSpy.mockReturnValueOnce(1 as unknown as NodeJS.Timeout)
            window.location.pathname = '/app/ticket/1'

            store.dispatch(actions.setTypingActivityShopper(1))
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('updateCustomFieldState()', () => {
        it('should dispatch UPDATE_CUSTOM_FIELD_STATE action', () => {
            store.dispatch(actions.updateCustomFieldState({id: 1, value: 'ok'}))
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('updateCustomFieldValue()', () => {
        it('should dispatch UPDATE_CUSTOM_FIELD_VALUE action', () => {
            store.dispatch(actions.updateCustomFieldValue(1, 'ok'))
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('updateCustomFieldError()', () => {
        it('should dispatch UPDATE_CUSTOM_FIELD_ERROR action', () => {
            store.dispatch(actions.updateCustomFieldError(1, true))
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('triggerTicketFieldsErrors()', () => {
        it('should dispatch SET_INVALID_CUSTOM_FIELDS_TO_ERRORED and notify action', () => {
            store.dispatch(actions.triggerTicketFieldsErrors([1, 2, 3]))
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('restoreTicketDraft()', () => {
        it('should dispatch RESTORE_TICKET_DRAFT action', () => {
            const ticketDraft = {
                assignee_team: null,
                assignee_user: null,
                customer: null,
                subject: '',
                tags: [],
            }
            expect(actions.restoreTicketDraft(ticketDraft)).toMatchSnapshot()
        })
    })

    describe('isTicketNavigationAvailable()', () => {
        it.each([
            // ticket is being created, ticketId = 'new' -> isTicketNavigationAvailable = false
            ['new', {}, false],
            // no active view -> isTicketNavigationAvailable = false
            [123, {views: fromJS({active: {}})}, false],
            // is customer view -> isTicketNavigationAvailable = false
            [
                123,
                {
                    views: fromJS({
                        active: {
                            id: 123,
                            search: 'test',
                            filters: 'test',
                            order_by: 'created_datetime',
                            type: ViewType.CustomerList,
                        },
                    }),
                },
                false,
            ],
            // view has `id' key -> isTicketNavigationAvailable = true
            [
                123,
                {
                    views: fromJS({
                        active: {
                            id: 123,
                            search: null,
                            filters: null,
                            order_by: 'created_datetime',
                            type: null,
                        },
                    }),
                },
                true,
            ],
            // view has `search` key -> isTicketNavigationAvailable = true
            [
                123,
                {
                    views: fromJS({
                        active: {
                            id: null,
                            search: 'test',
                            filters: null,
                            order_by: 'created_datetime',
                            type: null,
                        },
                    }),
                },
                true,
            ],
            // view has `filters` key -> isTicketNavigationAvailable = true
            [
                123,
                {
                    views: fromJS({
                        active: {
                            id: null,
                            search: null,
                            filters: 'test',
                            order_by: 'created_datetime',
                            type: null,
                        },
                    }),
                },
                true,
            ],
            // view has multiple required keys -> isTicketNavigationAvailable = true
            [
                123,
                {
                    views: fromJS({
                        active: {
                            id: 123,
                            search: 'test',
                            filters: 'test',
                            order_by: 'created_datetime',
                            type: 'testType',
                        },
                    }),
                },
                true,
            ],
            // view has multiple required keys, but no ordering -> isTicketNavigationAvailable = false
            [
                123,
                {
                    views: fromJS({
                        active: {
                            id: 123,
                            search: 'test',
                            filters: 'test',
                            order_by: undefined,
                            type: 'testType',
                        },
                    }),
                },
                false,
            ],
        ])(
            'should test if ticket navigation is available for ticketId and state',
            (ticketId, state, expectedResult) => {
                const store = mockStore(state as MockedRootState)
                const result = store.dispatch(
                    actions.isTicketNavigationAvailable(ticketId)
                )

                expect(result).toBe(expectedResult)
            }
        )
    })

    it('setHasAttemptedToCloseTicket', () => {
        store.dispatch(actions.setHasAttemptedToCloseTicket(true))
        return expect(store.getActions()).toMatchSnapshot()
    })
})
