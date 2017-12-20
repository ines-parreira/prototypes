import configureMockStore from 'redux-mock-store'
import axios from 'axios'
import moment from 'moment'
import MockAdapter from 'axios-mock-adapter'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import * as actions from '../actions'
import {initialState} from '../reducers'

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
        requester: {
            id: 1,
            customer: {id: 1},
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
                })
            })

            return store.dispatch(actions.mergeTicket(ticket))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    it('mergeRequester', () => {
        store.dispatch(actions.mergeRequester({id: 1}))
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

    it('setCategory', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
        return store.dispatch(actions.setCategory('delivery/status'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('removeCategory', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
        return store.dispatch(actions.removeCategory())
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

    it('setAgent', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
        return store.dispatch(actions.setAgent({id: 1}))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setRequester', () => {
        mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})
        return store.dispatch(actions.setRequester(fromJS({id: 1, custom: true})))
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
            mockServer.onGet('/api/tickets/1/').reply(200, {id: 1})
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
})
