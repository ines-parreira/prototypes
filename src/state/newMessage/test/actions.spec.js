import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {ContentState} from 'draft-js'
import {fromJS} from 'immutable'

import * as actions from '../actions'
import * as types from '../constants'
import {initialState} from '../reducers'

import {integrationsState} from '../../../fixtures/integrations'
import * as integrationSelectors from '../../integrations/selectors'
import {getPreferredChannel,} from '../../ticket/utils'
import {smoochTicket, emailTicket} from '../../ticket/test/fixtures'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => 'someRandomKey')

jest.mock('../../../services/socketManager', () => {
    return {
        join: jest.fn(),
        leave: jest.fn(),
        send: jest.fn(),
    }
})

import socketManager from '../../../services/socketManager'

describe('actions', () => {
    describe('new message', () => {
        const channels = integrationSelectors.getChannels({integrations: fromJS(integrationsState)})
        let store

        it('dispatch setSender - with address', () => {
            store = mockStore({
                integrations: fromJS(integrationsState),
                ticket: emailTicket,
                newMessage: initialState,
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.NEW_MESSAGE_SET_SENDER,
                sender: fromJS({
                    name: 'Acme Support',
                    address: 'support@acme.com'
                })
            }])
        })

        it('dispatch setSender - `from` field from last message from agent (chat, messenger)', () => {
            const from = smoochTicket.getIn(['messages', 1, 'source', 'from'])
            const expectedSender = fromJS({
                name: from.get('name'),
                address: from.get('address'),
            })
            store = mockStore({
                integrations: fromJS(integrationsState),
                ticket: smoochTicket,
                newMessage: initialState.setIn(['newMessage', 'source', 'type'], 'chat'),
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.NEW_MESSAGE_SET_SENDER,
                sender: expectedSender
            }])
        })

        it('dispatch setSender - `to` field from last message from customer (chat, messenger)', () => {
            // delete last message from agent
            const _smoochTicket = smoochTicket.deleteIn(['messages', 1])
            const from = _smoochTicket.getIn(['messages', 0, 'source', 'to', 0])
            const expectedSender = fromJS({
                name: from.get('name'),
                address: from.get('address'),
            })
            store = mockStore({
                integrations: fromJS(integrationsState),
                ticket: _smoochTicket,
                newMessage: initialState.setIn(['newMessage', 'source', 'type'], 'chat'),
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.NEW_MESSAGE_SET_SENDER,
                sender: expectedSender
            }])
        })

        it('dispatch setSender - preferred channel', () => {
            // remove messages, to simulate a new ticket
            const _emailTicket = emailTicket.set('messages', fromJS([]))
            const preferred = getPreferredChannel('email', channels)
            const expectedSender = fromJS({
                name: preferred.get('name'),
                address: preferred.get('address'),
            })
            store = mockStore({
                integrations: fromJS(integrationsState),
                ticket: _emailTicket,
                newMessage: initialState.setIn(['newMessage', 'source', 'type'], 'email'),
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.NEW_MESSAGE_SET_SENDER,
                sender: expectedSender
            }])
        })

        it('dispatch setSender - `from` field from last message from agent', () => {
            const from = emailTicket.getIn(['messages', 1, 'source', 'from'])
            const expectedSender = fromJS({
                name: from.get('name'),
                address: from.get('address'),
            })
            store = mockStore({
                integrations: fromJS(integrationsState),
                ticket: emailTicket,
                newMessage: initialState.setIn(['newMessage', 'source', 'type'], 'email'),
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.NEW_MESSAGE_SET_SENDER,
                sender: expectedSender
            }])
        })

        it('dispatch setSender - `to` field from last message from customer (email found in `to`)', () => {
            // delete last message from agent
            const _emailTicket = emailTicket.deleteIn(['messages', 1])
            const from = _emailTicket.getIn(['messages', 0, 'source', 'to', 1])
            const expectedSender = fromJS({
                name: from.get('name'),
                address: from.get('address'),
            })
            store = mockStore({
                integrations: fromJS(integrationsState),
                ticket: _emailTicket,
                newMessage: initialState.setIn(['newMessage', 'source', 'type'], 'email'),
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.NEW_MESSAGE_SET_SENDER,
                sender: expectedSender
            }])
        })

        it('should return channel in `cc` field from last message from customer (email found in `cc`)', () => {
            // delete last message from agent
            // and move `To` addresses in `Cc` and remove `To` addresses
            const _emailTicket = emailTicket.deleteIn(['messages', 1])
                .updateIn(['messages', 0, 'source'], source => {
                    return source.set('cc', source.get('to'))
                        .set('to', fromJS([]))
                })
            const from = _emailTicket.getIn(['messages', 0, 'source', 'cc', 1])
            const expectedSender = fromJS({
                name: from.get('name'),
                address: from.get('address'),
            })
            store = mockStore({
                integrations: fromJS(integrationsState),
                ticket: _emailTicket,
                newMessage: initialState.setIn(['newMessage', 'source', 'type'], 'email'),
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.NEW_MESSAGE_SET_SENDER,
                sender: expectedSender
            }])
        })

        it('dispatch setSender - preferred email (email not found in `to`)', () => {
            // remove address that can match
            const _emailTicket = emailTicket.deleteIn(['messages', 1])
            const from = getPreferredChannel('email', channels)
            const expectedSender = fromJS({
                name: from.get('name'),
                address: from.get('address'),
            })
            store = mockStore({
                integrations: fromJS(integrationsState),
                ticket: _emailTicket,
                newMessage: initialState.setIn(['newMessage', 'source', 'type'], 'email'),
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.NEW_MESSAGE_SET_SENDER,
                sender: expectedSender
            }])
        })

        it('dispatch setSender - empty name and address (internal-note)', () => {
            store = mockStore({
                integrations: fromJS(integrationsState),
                ticket: emailTicket,
                newMessage: initialState.setIn(['newMessage', 'source', 'type'], 'internal-note'),
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.NEW_MESSAGE_SET_SENDER,
                sender: fromJS({
                    name: '',
                    address: ''
                })
            }])
        })

        describe('setSubject()', () => {

            it('default value', () => {
                store = mockStore({
                    newMessage: initialState
                })
                store.dispatch(actions.setSubject())
                const expectedActions = store.getActions()

                expect(expectedActions).toMatchSnapshot()
            })

            it('given value', () => {
                store = mockStore({
                    newMessage: initialState
                })
                store.dispatch(actions.setSubject('hello world'))
                const expectedActions = store.getActions()

                expect(expectedActions).toMatchSnapshot()
            })
        })

        describe('prepare()', () => {
            it('email-forward', () => {
                store = mockStore({
                    ticket: emailTicket,
                    newMessage: initialState
                })
                store.dispatch(actions.prepare('email-forward'))
                const expectedActions = store.getActions()

                expect(expectedActions).toMatchSnapshot()
            })

            it('other types', () => {
                const sourceTypes = ['email', 'chat', 'facebook-comment', 'facebook-message']

                sourceTypes.forEach(sourceType => {
                    store = mockStore({
                        ticket: emailTicket,
                        newMessage: initialState
                    })
                    store.dispatch(actions.prepare(sourceType))

                    expect(store.getActions()).toMatchSnapshot()
                })
            })
        })

        describe('setResponseText()', () => {
            beforeEach(() => {
                socketManager.join.mockReset()
                socketManager.leave.mockReset()
                socketManager.send.mockReset()
            })

            it('should always pass the args to the reducer', () => {
                const contentState = ContentState.createFromText('foo')

                store.dispatch(actions.setResponseText(fromJS({contentState})))

                expect(store.getActions()).toMatchSnapshot()
            })

            it('should send typing event when the user is typing', () => {
                store = mockStore({
                    newMessage: initialState,
                    ticket: fromJS({id: 1}),
                    users: fromJS({
                        agents: [{
                            id: 1
                        }]
                    })
                })

                store.dispatch(actions.setResponseText(fromJS({
                    contentState: ContentState.createFromText('foo')
                })))

                expect(store.getActions()).toMatchSnapshot()
                expect(socketManager.send.mock.calls.length).toBe(1)
            })

            it('should not send a typing event when the user is typing in an internal-note', () => {
                store = mockStore({
                    newMessage: initialState.setIn(['newMessage', 'source', 'type'], 'internal-note'),
                    ticket: fromJS({id: 1})
                })

                store.dispatch(actions.setResponseText(fromJS({
                    contentState: ContentState.createFromText('foo')
                })))

                expect(store.getActions()).toMatchSnapshot()
                expect(socketManager.send.mock.calls.length).toBe(0)
            })

            it('should not send a typing event when the content is only the user\'s signature', () => {
                store = mockStore({
                    newMessage: initialState,
                    ticket: fromJS({id: 1}),
                    currentUser: fromJS({
                        signature_text: 'signature'
                    }),
                    users: fromJS({
                        agents: [{
                            id: 1
                        }]
                    })
                })

                store.dispatch(actions.setResponseText(fromJS({
                    contentState: ContentState.createFromText('\n\nsignature')
                })))

                expect(store.getActions()).toMatchSnapshot()
                expect(socketManager.send.mock.calls.length).toBe(0)
            })

            it('should send an end typing event on ticket when the user is not typing but is in the room', () => {
                store = mockStore({
                    newMessage: initialState,
                    ticket: fromJS({id: 1}),
                    users: fromJS({
                        agentsTypingStatus: {
                            1: {
                                Ticket: [1]
                            }
                        },
                        agents: [{
                            id: 1
                        }]
                    }),
                    currentUser: fromJS({
                        id: 1
                    })
                })

                store.dispatch(actions.setResponseText(fromJS({
                    contentState: ContentState.createFromText('')
                })))

                expect(store.getActions()).toMatchSnapshot()
                expect(socketManager.join.mock.calls.length).toBe(0)
                expect(socketManager.send.mock.calls.length).toBe(1)
            })

            it('should not send an end typing event when the user is not typing and not in ticket', () => {
                store = mockStore({
                    newMessage: initialState,
                    ticket: fromJS({id: 1}),
                    users: fromJS({
                        agentsTypingStatus: {},
                        agents: [{
                            id: 1
                        }]
                    }),
                    currentUser: fromJS({
                        id: 1
                    })
                })

                store.dispatch(actions.setResponseText(fromJS({
                    contentState: ContentState.createFromText('')
                })))

                expect(store.getActions()).toMatchSnapshot()
                expect(socketManager.send.mock.calls.length).toBe(0)
            })
        })
    })
})
