import querystring from 'querystring'
import url from 'url'

import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import axios from 'axios'
import moment from 'moment'
import MockAdapter from 'axios-mock-adapter'
import thunk from 'redux-thunk'
import {fromJS, Map} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'
import {removeNotification} from 'reapop'

import * as actions from '../actions'
import {initialState} from '../reducers'
import {notify} from '../../notifications/actions'
import {initialState as newMessageState} from '../../newMessage/reducers'
import {
    AuditLogEventType,
    AuditLogEvent,
    AuditLogEventObjectType,
} from '../../../models/event/types'
import {StoreDispatch} from '../../types'
import {Ticket, TicketMessage} from '../../../models/ticket/types'
import socketManager from '../../../services/socketManager/socketManager'
import {
    TicketMessageFailedEvent,
    SocketEventType,
} from '../../../services/socketManager/types'
import history from '../../../pages/history'

type MockedRootState = {
    ticket: Map<any, any>
    newMessage?: Map<any, any>
    currentUser?: Map<any, any>
    views?: Map<any, any>
}

jest.addMatchers(immutableMatchers)

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares
)

jest.mock('reapop', () => {
    const reapop = jest.requireActual('reapop')

    return {
        ...reapop,
        removeNotification: jest.fn(() => (args: Record<string, unknown>) =>
            args
        ),
    } as {
        removeNotification: jest.MockedFunction<
            typeof reapop.removeNotification
        >
    }
})
jest.mock('push.js', () => {
    return {
        create: jest.fn(),
    }
})

jest.mock('../../../utils', () => {
    const utils = require.requireActual('../../../utils')

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

jest.mock('../../../services/socketManager/socketManager', () => {
    return {
        join: jest.fn(),
        send: jest.fn(),
    }
})

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args: Record<string, unknown>) => args),
    }
})
jest.mock('../../../pages/history')

describe('ticket actions', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore({
            ticket: initialState,
            newMessage: newMessageState,
        })
        mockServer = new MockAdapter(axios)
        jest.clearAllMocks()
    })

    const ticket = ({
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
    } as unknown) as Ticket

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

    it('fetchTicketReplyMacro()', () => {
        store.dispatch(actions.fetchTicketReplyMacro())
        return expect(store.getActions()).toMatchSnapshot()
    })

    describe('ticketPartialUpdate()', () => {
        const update = {subject: 'new title'}

        it('fails because new ticket', () => {
            return store
                .dispatch(actions.ticketPartialUpdate(update))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('success', () => {
            mockServer.onPut('/api/tickets/1/').reply(200, {data: {id: 1}})

            store = mockStore({
                ticket: fromJS({id: 1}),
            })

            return store
                .dispatch(actions.ticketPartialUpdate(update))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    it('addTags()', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
        return store
            .dispatch(actions.addTags('refund, billing'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('removeTag()', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
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
            mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
            return store
                .dispatch(actions.setSpam(true))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should undo when clicking on notification button', () => {
            store = mockStore({
                ticket: initialState.set('id', 1),
            })
            mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})

            return store.dispatch(actions.setSpam(true)).then(() => {
                const button = ((notify as jest.MockedFunction<typeof notify>)
                    .mock.calls[0][0].buttons?.[0] as unknown) as {
                    onClick: () => Promise<void>
                }

                if (!button) {
                    throw new Error('property buttons is undefined')
                }
                return button.onClick().then(() => {
                    expect(removeNotification).toHaveBeenNthCalledWith(
                        1,
                        'spam-1'
                    )
                    expect(history.push).toHaveBeenNthCalledWith(
                        1,
                        '/app/ticket/1'
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
            mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})

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
            mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})

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
            mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})

            return store.dispatch(actions.setTrashed(date)).then(() => {
                const button = ((notify as jest.MockedFunction<typeof notify>)
                    .mock.calls[0][0].buttons?.[0] as unknown) as {
                    onClick: () => Promise<void>
                }

                if (!button) {
                    throw new Error('property buttons is undefined')
                }
                return button.onClick().then(() => {
                    expect(removeNotification).toHaveBeenNthCalledWith(
                        1,
                        'trash-1'
                    )
                    expect(history.push).toHaveBeenNthCalledWith(
                        1,
                        '/app/ticket/1'
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
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
        return store
            .dispatch(actions.setAgent({id: 1}))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setTeam()', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
        return store
            .dispatch(actions.setTeam({id: 1}))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setCustomer()', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
        return store
            .dispatch(actions.setCustomer(fromJS({id: 1, custom: true})))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setStatus()', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
        return store
            .dispatch(actions.setStatus('open'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setSubject()', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
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
        store.dispatch(actions.updateActionArgsOnApplied(0, 'hello', 1))
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
                .onGet('/api/tickets/1/')
                .reply(200, {id: 1, messages: []})
            store = mockStore({
                newMessage: newMessageState,
                ticket: initialState.set('id', 1),
                currentUser: fromJS({id: 1}),
            })
            return store
                .dispatch(actions.fetchTicket('1'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('existing instagram ticket', () => {
            mockServer.onGet('/api/tickets/1/').reply(200, {
                id: 1,
                messages: [{source: {type: 'instagram-comment'}}],
            })
            store = mockStore({
                newMessage: newMessageState,
                ticket: initialState.set('id', 1),
                currentUser: fromJS({id: 1}),
            })
            return store
                .dispatch(actions.fetchTicket('1'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should not dispatch new message when existing new message', () => {
            mockServer.onGet('/api/tickets/1/').reply(200, {
                id: 1,
                messages: [{source: {type: 'instagram-comment'}}],
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
                .onGet('/api/tickets/1/')
                .reply(200, {id: 1, messages: [], is_unread: true})
            store = mockStore({
                newMessage: newMessageState,
                ticket: initialState.set('id', 1),
                currentUser: fromJS({id: 1}),
            })
            return store
                .dispatch(actions.fetchTicket('1'))
                .then(() =>
                    expect(socketManager.send).toHaveBeenCalledWith(
                        SocketEventType.TicketViewed,
                        1
                    )
                )
        })

        it('should not send ticket-viewed event when ticket is read', () => {
            mockServer
                .onGet('/api/tickets/1/')
                .reply(200, {id: 1, messages: [], is_unread: false})
            store = mockStore({
                newMessage: newMessageState,
                ticket: initialState.set('id', 1),
                currentUser: fromJS({id: 1}),
            })
            return store
                .dispatch(actions.fetchTicket('1'))
                .then(() => expect(socketManager.send).not.toHaveBeenCalled())
        })
    })

    describe('handleMessageError()', () => {
        it('should fetch the ticket because the user is currently on it', () => {
            mockServer
                .onGet('/api/tickets/1/')
                .reply(200, {id: 1, messages: []})
            const json = ({
                ticket_id: '1',
                event: {
                    data: {
                        error: {
                            message: 'test handling message error',
                        },
                    },
                },
            } as unknown) as TicketMessageFailedEvent
            return store
                .dispatch(actions.handleMessageError(json))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should not fetch the ticket because the user is not currently on it', () => {
            mockServer
                .onGet('/api/tickets/2/')
                .reply(200, {id: 2, messages: []})

            const json = ({
                ticket_id: 2,
                event: {
                    data: {
                        error: {
                            message: 'test handling message error',
                        },
                    },
                },
            } as unknown) as TicketMessageFailedEvent

            return store
                .dispatch(actions.handleMessageError(json))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('handleMessageActionError()', () => {
        it('should fetch the ticket because the user is currently on it', () => {
            mockServer
                .onGet('/api/tickets/1/')
                .reply(200, {id: 1, messages: []})

            return store
                .dispatch(actions.handleMessageActionError('1'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should not fetch the ticket because the user is not currently on it', () => {
            mockServer
                .onGet('/api/tickets/2/')
                .reply(200, {id: 2, messages: []})

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
        afterEach(() => {
            jest.clearAllMocks()
        })

        it('should go to first view because there is no active view', (done) => {
            void store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app')
                done()
            })
        })

        it('should fetch next ticket and go to the active view because there is no ticket', (done) => {
            mockServer.onPut('/api/views/1/tickets/1/next').reply(200)
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}}),
            })

            void store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app/tickets/1')
                done()
            })
        })

        it('should fetch next ticket and go to this ticket', (done) => {
            const ticket = {id: 2, customerId: 1, messages: []}
            mockServer.onPut('/api/views/1/tickets/1/next').reply(200, ticket)
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}}),
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
                }
                mockServer
                    .onPut('/api/views/1/tickets/1/next')
                    .reply(200, ticket)
                store = mockStore({
                    ticket: initialState,
                    views: fromJS({active: {id: 1}}),
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
                .reply(200, {id: 2, messages: []})
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}}),
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
            })
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}}),
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
            })
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}}),
            })

            return store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(socketManager.send).not.toHaveBeenCalled()
            })
        })
    })

    describe('goToPrevTicket()', () => {
        afterEach(() => {
            jest.clearAllMocks()
        })

        it('should go to first view because there is no active view', (done) => {
            void store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app')
                done()
            })
        })

        it('should fetch previous ticket and go to the active view because there is no ticket', (done) => {
            mockServer.onPut('/api/views/1/tickets/2/prev').reply(200)
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}}),
            })

            void store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app/tickets/1')
                done()
            })
        })

        it('should fetch previous ticket and go to this ticket', (done) => {
            const ticket = {id: 1, customerId: 1, messages: []}
            mockServer.onPut('/api/views/1/tickets/2/prev').reply(200, ticket)
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}}),
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
                }
                mockServer
                    .onPut('/api/views/1/tickets/2/prev')
                    .reply(200, ticket)
                store = mockStore({
                    ticket: initialState,
                    views: fromJS({active: {id: 1}}),
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
                .reply(200, {id: 1, messages: []})
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}}),
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
            })
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}}),
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
        it('should not set the customer because we did not find any customer with this email address', () => {
            mockServer.onPost('/api/search/').reply(200, {data: []})
            store = mockStore({
                ticket: initialState,
            })

            return store
                .dispatch(actions.findAndSetCustomer('foo@gorgias.io'))
                .then(() => {
                    expect(store.getActions()).toEqual([])
                })
        })

        it('should not set the customer because we found too many customers matching this email address', () => {
            mockServer
                .onPost('/api/search/')
                .reply(200, {data: [{user: {id: 1}}, {user: {id: 2}}]})
            store = mockStore({
                ticket: initialState,
            })

            return store
                .dispatch(actions.findAndSetCustomer('foo@gorgias.io'))
                .then(() => {
                    expect(store.getActions()).toEqual([])
                })
        })

        it('should set the customer because there is exactly one customer matching this email address', () => {
            mockServer
                .onPost('/api/search/')
                .reply(200, {data: [{user: {id: 1}}]})
                .onGet('/api/customers/1/')
                .reply(200, {id: 1, name: 'foo', email: 'foo@gorgias.io'})
            store = mockStore({
                ticket: initialState,
            })

            return store
                .dispatch(actions.findAndSetCustomer('foo@gorgias.io'))
                .then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                })
        })
    })

    describe('loadAuditLogEvents()', () => {
        const getEvent = (id: number): AuditLogEvent => ({
            id,
            account_id: 1,
            user_id: 1,
            object_type: AuditLogEventObjectType.Ticket,
            object_id: 1,
            data: null,
            context: 'foo',
            type: AuditLogEventType.TicketReopened,
            created_datetime: '2019-11-15 19:00:00.000000',
        })

        it('should dispatch audit logs events, page per page', async () => {
            const ticketId = 123
            const path = `/api/tickets/${ticketId}/events/`
            const matcher = new RegExp(path + '*')

            const mocks = [
                {
                    data: [getEvent(1), getEvent(2), getEvent(3)],
                    meta: {next_page: `${path}?page=2`},
                },
                {
                    data: [getEvent(4), getEvent(5), getEvent(6)],
                    meta: {next_page: `${path}?page=3`},
                },
                {data: [getEvent(7), getEvent(8), getEvent(9)], meta: {}},
            ]

            mockServer.onGet(matcher).reply((config) => {
                const parsedUrl = url.parse(config.url || '')
                const parsedQuery = querystring.parse(parsedUrl.query || '')
                const page =
                    parsedQuery && parsedQuery.page
                        ? parseInt(parsedQuery.page as string)
                        : 1
                const index = page - 1
                return [200, mocks[index]]
            })

            await store.dispatch(actions.displayAuditLogEvents(ticketId))
            expect(store.getActions()).toMatchSnapshot()
        })

        it('should dispatch a notification because there is no event for the given ticket', async () => {
            const ticketId = 123
            const path = `/api/tickets/${ticketId}/events/`

            mockServer.onGet(path).reply(200, {data: [], meta: {}})

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
})
