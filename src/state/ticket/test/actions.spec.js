import configureMockStore from 'redux-mock-store'
import axios from 'axios'
import moment from 'moment'
import MockAdapter from 'axios-mock-adapter'
import thunk from 'redux-thunk'
import {browserHistory} from 'react-router'
import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import * as actions from '../actions'
import {initialState} from '../reducers'
import {initialState as newMessageState} from '../../newMessage/reducers'
import {findAndSetCustomer} from '../actions'

jest.addMatchers(immutableMatchers)

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

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
        isCurrentlyOnTicket: jest.fn(() => true),
    }
})

jest.mock('../../../services/socketManager', () => {
    return {
        join: jest.fn(),
        send: jest.fn(),
    }
})

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args) => args),
    }
})

describe('ticket actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({ticket: initialState})
        mockServer = new MockAdapter(axios)
    })

    const ticket = {
        id: 1,
        subject: 'title',
        messages: [{
            id: 1,
            body_text: 'hello',
            body_html: '<div>hello</div>',
            channel: 'email',
        }],
        customer: {
            id: 1,
            data: {hello: 'world!'},
        },
    }

    describe('mergeTicket', () => {
        it('fails because not current ticket', () => {
            return store.dispatch(actions.mergeTicket(ticket))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('success', () => {
            store = mockStore({
                ticket: fromJS({
                    id: 1,
                    messages: [],
                }),
                newMessage: newMessageState
                    .setIn(['newMessage', 'source', 'type'])
            })

            return store.dispatch(actions.mergeTicket(ticket))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    it('mergeCustomer', () => {
        store.dispatch(actions.mergeCustomer({id: 1}))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('fetchTicketReplyMacro', () => {
        store.dispatch(actions.fetchTicketReplyMacro())
        return expect(store.getActions()).toMatchSnapshot()
    })

    describe('ticketPartialUpdate', () => {
        const update = {subject: 'new title'}

        it('fails because new ticket', () => {
            return store.dispatch(actions.ticketPartialUpdate(update))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('success', () => {
            mockServer.onPut('/api/tickets/1/').reply(200, {data: {id: 1}})

            store = mockStore({
                ticket: fromJS({id: 1})
            })

            return store.dispatch(actions.ticketPartialUpdate(update))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    it('addTags', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
        return store.dispatch(actions.addTags('refund, billing'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('removeTag', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
        return store.dispatch(actions.removeTag('refund'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setRequest', () => {
        store = mockStore({
            ticket: initialState.set('messages', fromJS([
                {
                    id: 1,
                    ticket_id: 1,
                    from_agent: false,
                    request_id: 1,
                    created_datetime: '2017-01-09'
                },
                {
                    id: 2,
                    ticket_id: 2,
                    from_agent: true,
                    request_id: null,
                    created_datetime: '2017-01-10'
                },
                {
                    id: 3,
                    ticket_id: 3,
                    from_agent: false,
                    request_id: 2,
                    created_datetime: '2017-02-10'
                }
            ]))
        })
        mockServer.onPut(/\/api\/tickets\/\d+\/messages\/\d+/).reply(202, {data: {}})
        return store.dispatch(actions.setRequest(fromJS({id: 1})))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('removeRequest', () => {
        store = mockStore({
            ticket: initialState.set('messages', fromJS([
                {
                    id: 1,
                    ticket_id: 1,
                    from_agent: false,
                    request_id: 1,
                    created_datetime: '2017-01-09'
                }
            ]))
        })
        mockServer.onPut(/\/api\/tickets\/\d+\/messages\/\d+/).reply(202, {data: {}})
        return store.dispatch(actions.removeRequest())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    describe('setSpam', () => {
        it('fails because same status', () => {
            store = mockStore({ticket: initialState.set('spam', true)})
            return store.dispatch(actions.setSpam(true))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('success', () => {
            store = mockStore({ticket: initialState.set('id', 1)})
            mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
            return store.dispatch(actions.setSpam(true))
                .then(() => expect(store.getActions()).toMatchSnapshot())
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
            store = mockStore({ticket: initialState.set('id', 1).set('trashed_datetime', moment.utc())})
            mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})

            return store.dispatch(actions.setTrashed(null)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
            })
        })

        it('should not dispatch actions (same status)', () => {
            store = mockStore({ticket: initialState.set('trashed_datetime', null)})

            store.dispatch(actions.setTrashed(null)).then(() => {
                expect(store.getActions()).toEqual([])
            })

            store = mockStore({ticket: initialState.set('trashed_datetime', moment.utc())})

            store.dispatch(actions.setTrashed(moment.utc())).then(() => {
                expect(store.getActions()).toEqual([])
            })
        })

    })

    describe('setSnooze', () => {
        it('should snooze ticket', () => {
            store = mockStore({ticket: initialState.set('snooze_datetime', null)})

            store.dispatch(actions.setSnooze('2017-12-21')).then(() => {
                expect(store.getActions()).toMatchSnapshot()
            })
        })

        it('should snooze ticket and call the callback', () => {
            const callbackSpy = jest.fn()
            store = mockStore({ticket: initialState.set('snooze_datetime', null)})

            store.dispatch(actions.setSnooze('2017-12-21', callbackSpy)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(callbackSpy).toHaveBeenCalled()
            })
        })
    })

    it('setAgent', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
        return store.dispatch(actions.setAgent({id: 1}))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setCustomer', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
        return store.dispatch(actions.setCustomer(fromJS({id: 1, custom: true})))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setStatus', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
        return store.dispatch(actions.setStatus('open'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setSubject', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
        return store.dispatch(actions.setSubject('new title'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('deleteMessage', () => {
        mockServer.onDelete('/api/tickets/1/messages/10/').reply(200)
        return store.dispatch(actions.deleteMessage(1, 10))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('deleteActionOnApplied', () => {
        store.dispatch(actions.deleteActionOnApplied(0, 1))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('updateActionArgsOnApplied', () => {
        store.dispatch(actions.updateActionArgsOnApplied(0, 'hello', 1))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('applyMacroAction', () => {
        const action = fromJS({
            type: 'user',
            name: 'setResponseText',
            arguments: {
                contentState: {},
                selectionState: {},
            },
        })

        store = mockStore({ticket: initialState.set('id', 1)})
        return expect(store.dispatch(actions.applyMacroAction(action))).toMatchSnapshot()
    })

    it('applyMacro', () => {
        const macro = fromJS({
            id: 1,
            actions: [{
                type: 'user',
                name: 'setResponseText',
                arguments: {
                    contentState: {},
                    selectionState: {},
                },
            }, {
                type: 'user',
                name: 'addTags',
                arguments: {
                    tags: 'refund, billing',
                },
            }]
        })

        store = mockStore({
            ticket: initialState.set('id', 1),
            currentUser: fromJS({id: 1}),
        })
        return store.dispatch(actions.applyMacro(macro, 1))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('clearAppliedMacro', () => {
        store.dispatch(actions.clearAppliedMacro(1))
        return expect(store.getActions()).toMatchSnapshot()
    })

    describe('fetchTicket', () => {
        it('new ticket', () => {
            return store.dispatch(actions.fetchTicket('new'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('existing ticket', () => {
            mockServer.onGet('/api/tickets/1/').reply(200, {id: 1, messages: []})
            store = mockStore({
                ticket: initialState.set('id', 1),
                currentUser: fromJS({id: 1}),
            })
            return store.dispatch(actions.fetchTicket(1))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('existing instagram ticket', () => {
            mockServer.onGet('/api/tickets/1/').reply(200, {id: 1, messages: [{source: {type: 'instagram-comment'}}]})
            store = mockStore({
                ticket: initialState.set('id', 1),
                currentUser: fromJS({id: 1}),
            })
            return store.dispatch(actions.fetchTicket(1))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    it('handleMessageActionError', () => {
        store.dispatch(actions.handleMessageActionError(1))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('updateTicketMessage', () => {
        mockServer.onPut('/api/tickets/1/messages/10/?action=retry').reply(200, {id: 10})
        return store.dispatch(actions.updateTicketMessage(1, 10, {id: 10}, 'retry'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('clearTicket', () => {
        store.dispatch(actions.clearTicket())
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('toggleHistory', () => {
        expect(actions.toggleHistory(true)).toMatchSnapshot()
        expect(actions.toggleHistory(false)).toMatchSnapshot()
    })

    it('displayHistoryOnNextPage', () => {
        expect(actions.displayHistoryOnNextPage(true)).toMatchSnapshot()
        expect(actions.displayHistoryOnNextPage(false)).toMatchSnapshot()
        expect(actions.displayHistoryOnNextPage()).toMatchSnapshot()
    })

    it('deleteTicket', () => {
        mockServer.onDelete('/api/tickets/13/').reply(200)
        return store.dispatch(actions.deleteTicket(13))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('deleteTicketPendingMessage', () => {
        store.dispatch(actions.deleteTicketPendingMessage({id: 1}))
        return expect(store.getActions()).toMatchSnapshot()
    })

    describe('goToNextTicket()', () => {
        afterEach(() => {
            jest.clearAllMocks()
        })

        it('should go to first view because there is no active view', (done) => {
            store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(browserHistory.push).toHaveBeenCalledWith('/app')
                done()
            })
        })

        it('should fetch next ticket and go to the active view because there is no ticket', (done) => {
            mockServer.onPut('/api/views/1/tickets/1/next').reply(200)
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}})
            })

            store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(browserHistory.push).toHaveBeenCalledWith('/app/tickets/1')
                done()
            })
        })

        it('should fetch next ticket and go to this ticket', (done) => {
            const ticket = {id: 2, customerId: 1, messages: []}
            mockServer.onPut('/api/views/1/tickets/1/next').reply(200, ticket)
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}})
            })

            const fetchTicketPromise = store.dispatch(actions.goToNextTicket(1))

            expect(store.getActions()).not.toEqual([])

            fetchTicketPromise.then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(browserHistory.push).toHaveBeenCalledWith('/app/ticket/2')
                done()
            })
        })

        it('should fetch next ticket and go to this ticket, and prepare new message correctly as the ticket is an ' +
            'instagram ticket', (done) => {
            const ticket = {id: 2, customerId: 1, messages: [{source: {type: 'instagram-comment'}}]}
            mockServer.onPut('/api/views/1/tickets/1/next').reply(200, ticket)
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}})
            })

            const fetchTicketPromise = store.dispatch(actions.goToNextTicket(1))

            fetchTicketPromise.then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(browserHistory.push).toHaveBeenCalledWith('/app/ticket/2')
                done()
            })
        })

        it('should fetch next ticket and wait for promise to be resolved to go to this ticket', (done) => {
            mockServer.onPut('/api/views/1/tickets/1/next').reply(200, {id: 2, messages: []})
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}})
            })

            const promise = Promise.resolve()
            const fetchTicketPromise = store.dispatch(actions.goToNextTicket(1, promise))

            fetchTicketPromise.then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(browserHistory.push).toHaveBeenCalledWith('/app/ticket/2')
                done()
            })
        })
    })

    describe('goToPrevTicket()', () => {
        afterEach(() => {
            jest.clearAllMocks()
        })

        it('should go to first view because there is no active view', (done) => {
            store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(browserHistory.push).toHaveBeenCalledWith('/app')
                done()
            })
        })

        it('should fetch previous ticket and go to the active view because there is no ticket', (done) => {
            mockServer.onPut('/api/views/1/tickets/2/prev').reply(200)
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}})
            })

            store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(browserHistory.push).toHaveBeenCalledWith('/app/tickets/1')
                done()
            })
        })

        it('should fetch previous ticket and go to this ticket', (done) => {
            const ticket = {id: 1, customerId: 1, messages: []}
            mockServer.onPut('/api/views/1/tickets/2/prev').reply(200, ticket)
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}})
            })

            const fetchTicketPromise = store.dispatch(actions.goToPrevTicket(2))

            expect(store.getActions()).not.toEqual([])

            fetchTicketPromise.then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(browserHistory.push).toHaveBeenCalledWith('/app/ticket/1')
                done()
            })
        })

        it('should fetch previous ticket and go to this ticket, and prepare new message correctly as the ticket is ' +
            'an instagram ticket', (done) => {
            const ticket = {id: 1, customerId: 1, messages: [{source: {type: 'instagram-comment'}}]}
            mockServer.onPut('/api/views/1/tickets/2/prev').reply(200, ticket)
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}})
            })

            const fetchTicketPromise = store.dispatch(actions.goToPrevTicket(2))

            expect(store.getActions()).not.toEqual([])

            fetchTicketPromise.then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(browserHistory.push).toHaveBeenCalledWith('/app/ticket/1')
                done()
            })
        })

        it('should fetch previous ticket and wait for promise to be resolved to go to this ticket', (done) => {
            mockServer.onPut('/api/views/1/tickets/2/prev').reply(200, {id: 1, messages: []})
            store = mockStore({
                ticket: initialState,
                views: fromJS({active: {id: 1}})
            })

            const promise = Promise.resolve()
            const fetchTicketPromise = store.dispatch(actions.goToPrevTicket(2, promise))

            expect(store.getActions()).toEqual([])

            fetchTicketPromise.then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(browserHistory.push).toHaveBeenCalledWith('/app/ticket/1')
                done()
            })
        })
    })

    describe('findAndSetCustomer', () => {
        it('should not set the customer because we did not find any user with this email address', () => {
            mockServer.onPost('/api/search/').reply(200, {data: []})
            store = mockStore({
                ticket: initialState
            })

            store.dispatch(findAndSetCustomer('foo@gorgias.io')).then(() => {
                expect(store.getActions()).toEqual([])
            })
        })

        it('should not set the customer because we found too many users matching this email address', () => {
            mockServer.onPost('/api/search/').reply(200, {data: [{user: {id: 1}}, {user: {id: 2}}]})
            store = mockStore({
                ticket: initialState
            })

            store.dispatch(findAndSetCustomer('foo@gorgias.io')).then(() => {
                expect(store.getActions()).toEqual([])
            })
        })

        it('should set the customer because there is exactly one user matching this email address', () => {
            mockServer
                .onPost('/api/search/').reply(200, {data: [{user: {id: 1}}]})
                .onGet('/api/users/1/').reply(200, {id: 1, name: 'foo', email: 'foo@gorgias.io'})
            store = mockStore({
                ticket: initialState
            })

            store.dispatch(findAndSetCustomer('foo@gorgias.io')).then(() => {
                expect(store.getActions()).toMatchSnapshot()
            })
        })
    })
})
