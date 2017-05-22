import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as types from '../constants'
import {submitSetting} from '../actions'
import {initialState} from '../reducers'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {userSetting} from '../../../fixtures/user'
import {fromJS} from 'immutable'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('actions', () => {
    describe('currentUser', () => {
        let store
        let mockServer

        beforeEach(() => {
            store = mockStore(initialState)
            mockServer = new MockAdapter(axios)
        })

        it('should submit setting (create)', () => {
            const setting = fromJS(userSetting).delete('id').toJS()
            const expectedActions = [{
                type: types.SUBMIT_SETTING_START,
                settingType: 'ticket-views',
            }, {
                type: types.SUBMIT_SETTING_SUCCESS,
                settingType: 'ticket-views',
                isUpdate: false,
                resp: userSetting
            }]

            mockServer.onPost('/api/users/0/settings/').reply(201, userSetting)

            return store.dispatch(submitSetting(setting)).then(() => {
                expect(store.getActions()).toEqual(expectedActions)
            })
        })

        it('should submit setting (update)', () => {
            const expectedActions = [{
                type: types.SUBMIT_SETTING_START,
                settingType: 'ticket-views'

            }, {
                type: types.SUBMIT_SETTING_SUCCESS,
                settingType: 'ticket-views',
                isUpdate: true,
                resp: userSetting
            }]

            mockServer.onPut(`/api/users/0/settings/${userSetting.id}/`).reply(202, userSetting)

            return store.dispatch(submitSetting(userSetting)).then(() => {
                expect(store.getActions()).toEqual(expectedActions)
            })
        })
    })
})
