import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../actions'
import integrationState from '../../integrations/tests/fixtures'
import {getChannels} from '../../integrations/selectors'
import {getPreferredChannel} from '../utils'
import {smoochTicket, emailTicket} from './fixtures'
import * as types from '../constants'
import {initialState} from '../reducers'
import {fromJS} from 'immutable'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('actions', () => {
    describe('ticket', () => {
        const channels = getChannels(integrationState)
        let store

        it('dispatch setSender - with address', () => {
            store = mockStore({
                integrations: integrationState.integrations,
                ticket: initialState
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.SET_SENDER,
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
                integrations: integrationState.integrations,
                ticket: smoochTicket
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.SET_SENDER,
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
                integrations: integrationState.integrations,
                ticket: _smoochTicket
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.SET_SENDER,
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
                integrations: integrationState.integrations,
                ticket: _emailTicket
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.SET_SENDER,
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
                integrations: integrationState.integrations,
                ticket: emailTicket
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.SET_SENDER,
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
                integrations: integrationState.integrations,
                ticket: _emailTicket
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.SET_SENDER,
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
                integrations: integrationState.integrations,
                ticket: _emailTicket
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.SET_SENDER,
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
                integrations: integrationState.integrations,
                ticket: _emailTicket
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.SET_SENDER,
                sender: expectedSender
            }])
        })

        it('dispatch setSender - empty Map (internal-note)', () => {
            const _emailTicket = emailTicket.setIn(['newMessage', 'source', 'type'], 'internal-note')
            store = mockStore({
                integrations: integrationState.integrations,
                ticket: _emailTicket
            })
            store.dispatch(actions.setSender())
            const expectedActions = store.getActions()

            expect(expectedActions).toEqual([{
                type: types.SET_SENDER,
                sender: fromJS({})
            }])
        })
    })
})
