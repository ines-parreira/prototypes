import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'

import history from '../../../pages/history'
import * as actions from '../actions'
import {initialState} from '../reducers'
import client from '../../../models/api/resources'
import {StoreDispatch} from '../../types'
import {Integration, IntegrationType} from '../../../models/integration/types'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args: unknown) => args),
    }
})
jest.mock('../../../pages/history.ts')

window.location = {
    pathname: '/integration/1',
} as Location

describe('integrations actions', () => {
    let store: MockStoreEnhanced<unknown, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore({integrations: initialState})
        mockServer = new MockAdapter(client)
    })

    it('fetch integrations', () => {
        mockServer
            .onGet('/api/integrations')
            .reply(200, {data: [{id: 1, name: 'http'}], meta: {}})

        return store
            .dispatch(actions.fetchIntegrations())
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('should do some action and redirect correctly on create email success', () => {
        const integration = {
            id: 1,
            type: IntegrationType.Email,
        } as Integration

        const p = history.push
        let logUrl = ''

        history.push = (url: string) => (logUrl = url)

        actions.onCreateSuccess(store.dispatch, integration)
        expect(store.getActions()).toMatchSnapshot()
        expect(logUrl).toMatchSnapshot()

        history.push = p
    })

    it('should do some action and redirect correctly on create smooch_inside success', () => {
        const integration = {
            id: 1,
            type: IntegrationType.SmoochInside,
        } as Integration

        const p = history.push
        let logUrl = ''

        history.push = (url: string) => (logUrl = url)

        actions.onCreateSuccess(store.dispatch, integration)
        expect(store.getActions()).toMatchSnapshot()
        expect(logUrl).toMatchSnapshot()

        history.push = p
    })

    it('should do some action and redirect correctly on create smooch success', () => {
        const integration = {
            id: 1,
            type: IntegrationType.Smooch,
        } as Integration

        const p = history.push
        let logUrl = ''

        history.push = (url: string) => (logUrl = url)

        actions.onCreateSuccess(store.dispatch, integration)
        expect(store.getActions()).toMatchSnapshot()
        expect(logUrl).toMatchSnapshot()

        history.push = p
    })

    it('on update success', () => {
        const integration = {
            id: 1,
            type: IntegrationType.Email,
        } as Integration

        void actions.onUpdateSuccess(store.dispatch, integration)
        expect(store.getActions()).toMatchSnapshot()
    })

    describe('fetch integration', () => {
        it('success', () => {
            mockServer
                .onGet('/api/integrations/1/')
                .reply(200, {id: 1, name: 'http'})

            return store
                .dispatch(actions.fetchIntegration('1', 'http'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('success waiting for authentication', () => {
            mockServer
                .onGet('/api/integrations/1/')
                .reply(200, {id: 1, name: 'http'})

            return store
                .dispatch(actions.fetchIntegration('1', 'http', true))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('fails', () => {
            mockServer.onGet('/api/integrations/1/').reply(400)

            return store
                .dispatch(actions.fetchIntegration('1', 'http'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    it('delete integration', () => {
        const integration = fromJS({
            id: 1,
            type: IntegrationType.Email,
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

    describe('createGorgiasChatIntegration action', () => {
        it('should redirect to preferences page for shopify', async () => {
            const data = fromJS({
                type: 'gorgias_chat',
                meta: {
                    shop_integration_id: 1,
                },
            })
            mockServer.onPost('/api/integrations/').reply(201, {
                id: 123,
                meta: {
                    shop_integration_id: 1,
                },
            })
            mockServer.onPut('/api/integrations/123').reply(200, {
                id: 123,
                meta: {
                    shop_integration_id: 1,
                },
            })

            await store.dispatch(actions.createGorgiasChatIntegration(data))

            expect(history.push).toHaveBeenCalledWith(
                '/app/settings/integrations/gorgias_chat/123/preferences'
            )
        })

        it('should redirect to installation page if automatic install failed', async () => {
            const data = fromJS({
                type: 'gorgias_chat',
                meta: {
                    shop_integration_id: 1,
                },
            })
            mockServer.onPost('/api/integrations/').reply(201, {
                id: 123,
                meta: {
                    shop_integration_id: 1,
                },
            })
            mockServer.onPut('/api/integrations/123').reply(400, {
                error: {msg: 'Something went wrong'},
            })

            await store.dispatch(actions.createGorgiasChatIntegration(data))

            expect(history.push).toHaveBeenCalledWith(
                '/app/settings/integrations/gorgias_chat/123/installation'
            )
        })

        it('should redirect to installation page for non-shopify', async () => {
            const data = fromJS({
                type: 'gorgias_chat',
                meta: {},
            })
            mockServer.onPost('/api/integrations/').reply(201, {
                id: 123,
                meta: {},
            })

            await store.dispatch(actions.createGorgiasChatIntegration(data))

            expect(history.push).toHaveBeenCalledWith(
                '/app/settings/integrations/gorgias_chat/123/installation'
            )
        })
    })
})
