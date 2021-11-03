import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import history from '../../../pages/history.ts'
import * as actions from '../actions.ts'
import {initialState} from '../reducers.ts'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions.ts', () => {
    return {
        notify: jest.fn(() => (args) => args),
    }
})
jest.mock('../../../pages/history.ts')

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
        mockServer
            .onGet('/api/integrations/')
            .reply(200, {data: [{id: 1, name: 'http'}]})

        return store
            .dispatch(actions.fetchIntegrations())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('should do some action and redirect correctly on create email success', () => {
        const integration = {
            id: 1,
            type: 'email',
        }

        const p = history.push
        let logUrl = ''

        history.push = (url) => (logUrl = url)

        actions.onCreateSuccess(store.dispatch, integration)
        expect(store.getActions()).toMatchSnapshot()
        expect(logUrl).toMatchSnapshot()

        history.push = p
    })

    it('should do some action and redirect correctly on create smooch_inside success', () => {
        const integration = {
            id: 1,
            type: 'smooch_inside',
        }

        const p = history.push
        let logUrl = ''

        history.push = (url) => (logUrl = url)

        actions.onCreateSuccess(store.dispatch, integration)
        expect(store.getActions()).toMatchSnapshot()
        expect(logUrl).toMatchSnapshot()

        history.push = p
    })

    it('should do some action and redirect correctly on create smooch success', () => {
        const integration = {
            id: 1,
            type: 'smooch',
        }

        const p = history.push
        let logUrl = ''

        history.push = (url) => (logUrl = url)

        actions.onCreateSuccess(store.dispatch, integration)
        expect(store.getActions()).toMatchSnapshot()
        expect(logUrl).toMatchSnapshot()

        history.push = p
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
            mockServer
                .onGet('/api/integrations/1/')
                .reply(200, {id: 1, name: 'http'})

            return store
                .dispatch(actions.fetchIntegration(1, 'http'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('success waiting for authentication', () => {
            mockServer
                .onGet('/api/integrations/1/')
                .reply(200, {id: 1, name: 'http'})

            return store
                .dispatch(actions.fetchIntegration(1, 'http', true))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('fails', () => {
            mockServer.onGet('/api/integrations/1/').reply(400)

            return store
                .dispatch(actions.fetchIntegration(1, 'http'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    it('delete integration', () => {
        const integration = fromJS({
            id: 1,
            type: 'email',
        })

        mockServer.onDelete('/api/integrations/1/').reply(200)

        return store
            .dispatch(actions.deleteIntegration(integration))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('delete integration error', () => {
        const integration = fromJS({
            id: 1,
            type: 'email',
        })

        mockServer.onDelete('/api/integrations/1/').reply(400)

        return store
            .dispatch(actions.deleteIntegration(integration))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    describe('verifyEmailIntegration action', () => {
        it('should dispatch an EMAIL_INTEGRATION_VERIFIED action on success', () => {
            store = mockStore({integrations: fromJS({integration: {id: 1}})})
            mockServer.onPost('/api/integrations/1/verify/').reply(201)

            return store
                .dispatch(actions.verifyEmailIntegration('foo'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should dispatch an EMAIL_INTEGRATION_VERIFIED action on error', () => {
            store = mockStore({integrations: fromJS({integration: {id: 1}})})
            mockServer.onPost('/api/integrations/1/verify/').reply(400)

            return store
                .dispatch(actions.verifyEmailIntegration('foo'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })
})
