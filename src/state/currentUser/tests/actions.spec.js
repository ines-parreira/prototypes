import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'

import * as actions from '../actions'
import {initialState} from '../reducers'
import * as types from '../constants'

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
            const data = {type: 'macro', hello: 'world', data: {}}

            mockServer.onPost('/api/users/0/settings/').reply(200, data)

            return store.dispatch(actions.submitSetting(data))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('update', () => {
            const data = {type: 'macro', id: 1, hello: 'world', data: {}}

            mockServer.onPut('/api/users/0/settings/1/').reply(200, data)

            return store.dispatch(actions.submitSetting(data))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should update available status and fetch chats', (done) => {
            // the current user is available by default
            const settings = fromJS([{
                type: 'preferences',
                data: {'available': true}
            }])
            const state = initialState.set('settings', settings)
            store = mockStore({currentUser: state})

            // update his status
            const newSetting = {type: 'preferences', data: {'available': false}}
            const chats = {
                tickets: [{id: 1}]
            }
            mockServer.onPost('/api/users/0/settings/').reply(200, newSetting)
            mockServer.onGet('/api/activity/chats/').reply(200, chats)

            return store.dispatch(actions.submitSetting(newSetting))
                .then(() => {
                    setTimeout(() => {
                        expect(store.getActions()).toMatchSnapshot()
                        done()
                    }, 1)
                })
        })
    })

    describe('toggleActiveStatus()', () => {
        it('should dispatch without status', () => {

            const expectedActions = [{
                type: types.TOGGLE_ACTIVE_STATUS,
            }]
            store.dispatch(actions.toggleActiveStatus())
            expect(store.getActions()).toEqual(expectedActions)
        })
        it('should dispatch with status', () => {
            const expectedActions = [{
                type: types.TOGGLE_ACTIVE_STATUS,
                status: true
            }]
            store.dispatch(actions.toggleActiveStatus(true))
            expect(store.getActions()).toEqual(expectedActions)
        })

        it('should not dispatch when the status is the same', () => {
            store = mockStore({
                currentUser: initialState.set('is_active', true)
            })
            store.dispatch(actions.toggleActiveStatus(true))
            expect(store.getActions()).toEqual([])
        })
    })
})
