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
        notify: jest.fn(() => (args) => (args)),
    }
})

jest.mock('react-router', () => {
    const reactRouter = require.requireActual('react-router')

    return {
        ...reactRouter,
        browserHistory: {
            push: jest.fn(),
            replace: jest.fn(),
        },
    }
})

window.location = {
    pathname: '/integration/1',
}

describe('integrations actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({integrations: initialState})
        mockServer = new MockAdapter(axios)
    })

    it('fetch integrations', () => {
        mockServer.onGet('/api/integrations/').reply(200, {data: [{id: 1, name: 'http'}]})

        return store.dispatch(actions.fetchIntegrations())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('on create email success', () => {
        const integration = {
            id: 1,
            type: 'email',
        }

        actions.onCreateSuccess(store.dispatch, integration)
        expect(store.getActions()).toMatchSnapshot()
    })

    it('on create smooch_inside success', () => {
        const integration = {
            id: 1,
            type: 'smooch_inside',
        }

        actions.onCreateSuccess(store.dispatch, integration)
        expect(store.getActions()).toMatchSnapshot()
    })

    it('on update success', () => {
        const integration = {
            id: 1,
            type: 'email',
        }

        actions.onUpdateSuccess(store.dispatch, integration)
        expect(store.getActions()).toMatchSnapshot()
    })

    describe('fetch integration', () => {
        it('success', () => {
            mockServer.onGet('/api/integrations/1/').reply(200, {id: 1, name: 'http'})

            return store.dispatch(actions.fetchIntegration(1, 'http'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('success waiting for authentication', () => {
            mockServer.onGet('/api/integrations/1/').reply(200, {id: 1, name: 'http'})

            return store.dispatch(actions.fetchIntegration(1, 'http', true))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('fails', () => {
            mockServer.onGet('/api/integrations/1/').reply(400)

            return store.dispatch(actions.fetchIntegration(1, 'http'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    it('delete integration', () => {
        const integration = fromJS({
            id: 1,
            type: 'email',
        })

        mockServer.onDelete('/api/integrations/1/').reply(200)

        return store.dispatch(actions.deleteIntegration(integration))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })
})
