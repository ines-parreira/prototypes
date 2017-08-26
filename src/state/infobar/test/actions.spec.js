import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as actions from '../actions'
import {initialState} from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn((args) => ({...args, type: 'NOTIFY-MOCK'})),
    }
})

jest.mock('../../../utils', () => {
    const utils = require.requireActual('../../../utils')

    return {
        ...utils,
        isCurrentlyOnTicket: jest.fn((ticketId) => ticketId === 1),
    }
})

describe('infobar actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({
            infobar: initialState,
            ticket: fromJS({id: 1}),
        })
        mockServer = new MockAdapter(axios)
    })

    it('search', () => {
        mockServer.onPost('/api/search/').reply(200, {data: [{id: 1, name: 'alex'}]})

        return store.dispatch(actions.search('alex'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('similar user', () => {
        mockServer.onGet('/api/users/1/similar/').reply(200, {id: 1, name: 'alex'})

        return store.dispatch(actions.similarUser(2))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    describe('fetch user picture', () => {
        const email = 'alex@gorgias.io'
        const md5 = 'b0603c6a6734698e0b93b1350c6c8286'
        const gravatar_url = `https://www.gravatar.com/avatar/${md5}?d=404&s=50`
        const picasa_url = `https://picasaweb.google.com/data/entry/api/user/${encodeURIComponent(email)}?alt=json`

        it('gravatar', () => {
            mockServer.onGet(gravatar_url).reply(200)

            return store.dispatch(actions.fetchUserPicture(email))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('picasaweb', () => {
            mockServer.onGet(gravatar_url).reply(400)
            mockServer.onGet(picasa_url).reply(200, {entry: {gphoto$thumbnail: {$t: 'http://good.url'}}})

            return store.dispatch(actions.fetchUserPicture(email))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('fail', () => {
            mockServer.onGet(gravatar_url).reply(400)
            mockServer.onGet(picasa_url).reply(400)

            return store.dispatch(actions.fetchUserPicture(email))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('execute action', () => {
        const actionName = 'shopifyRefundShippingCostOfOrder'
        const integrationId = 5
        const userId = 34
        const payload = {order_id: 4194477515}
        const callback = jest.fn()

        it('success', () => {
            mockServer.onPost('/api/actions/execute/').reply(200)

            return store.dispatch(actions.executeAction(actionName, integrationId, userId, payload, callback))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('fail', () => {
            mockServer.onPost('/api/actions/execute/').reply(400)

            return store.dispatch(actions.executeAction(actionName, integrationId, userId, payload, callback))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('handle executed action', () => {
        it('success', () => {
            const response = {
                status: 'success',
            }

            store.dispatch(actions.handleExecutedAction(response))
            expect(store.getActions()).toMatchSnapshot()
        })

        it('display error', () => {
            const response = {
                status: 'error',
                msg: '[SHOPIFY] [full-refund] No way',
            }

            store.dispatch(actions.handleExecutedAction(response))
            expect(store.getActions()).toMatchSnapshot()
        })

        it('display error from ticket currently on', () => {
            const response = {
                status: 'error',
                ticket_id: 1,
                msg: '[SHOPIFY] [full-refund] No way',
            }

            store.dispatch(actions.handleExecutedAction(response))
            expect(store.getActions()).toMatchSnapshot()
        })

        it('display error from ticket not currently on', () => {
            const response = {
                status: 'error',
                ticket_id: 2,
                msg: '[SHOPIFY] [full-refund] No way',
            }

            store.dispatch(actions.handleExecutedAction(response))
            expect(store.getActions()).toMatchSnapshot()
        })
    })
})
