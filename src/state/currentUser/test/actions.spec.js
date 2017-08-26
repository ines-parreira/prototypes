import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import * as actions from '../actions'
import {initialState} from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args) => args),
    }
})

describe('current user actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({currentUser: initialState})
        mockServer = new MockAdapter(axios)
    })

    it('change password', () => {
        const data = {
            old_password: 'password',
            new_password: 'newPassword',
        }

        mockServer.onPut('/api/users/0/').reply(200, data)

        return store.dispatch(actions.changePassword(data))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    describe('submit setting', () => {
        it('creation', () => {
            const data = {type: 'macro', hello: 'world'}

            mockServer.onPost('/api/users/0/settings/').reply(200, data)

            return store.dispatch(actions.submitSetting(data))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('update', () => {
            const data = {type: 'macro', id: 1, hello: 'world'}

            mockServer.onPut('/api/users/0/settings/1/').reply(200, data)

            return store.dispatch(actions.submitSetting(data))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })
})
