import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'

import * as actions from '../actions'
import {initialState} from '../reducers'
import * as types from '../constants'
import {UserSetting, UserSettingType} from '../../../config/types/user'
import client from '../../../models/api/resources'
import {StoreDispatch} from '../../types'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args: unknown) => args),
    }
})
describe('current user actions', () => {
    let store: MockStoreEnhanced<unknown, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore({
            currentUser: initialState,
        })
        mockServer = new MockAdapter(client)
    })

    it('change password', () => {
        const data = {
            old_password: 'password',
            new_password: 'newPassword',
        }
        mockServer.onPut('/api/users/0/').reply(200, data)
        return store
            .dispatch(
                actions.changePassword(data.old_password, data.new_password)
            )
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    describe('submit setting', () => {
        it('creation', () => {
            const data = {
                type: 'macro',
                hello: 'world',
                data: {},
            } as unknown as UserSetting
            mockServer
                .onPost('/api/users/0/settings/')
                .reply(200, {...data, id: 1})
            return store
                .dispatch(actions.submitSetting(data, false))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('update', () => {
            const data = {
                type: 'macro',
                id: 1,
                hello: 'world',
                data: {},
            } as unknown as UserSetting
            mockServer.onPut('/api/users/0/settings/1/').reply(200, data)
            return store
                .dispatch(actions.submitSetting(data, false))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should update available status and fetch chats', (done) => {
            // the current user is available by default
            const settings = fromJS([
                {
                    type: 'preferences',
                    data: {
                        available: true,
                    },
                },
            ])
            const state = initialState.set('settings', settings)
            store = mockStore({
                currentUser: state,
            })
            // update his status
            const newSetting = {
                type: 'preferences',
                data: {
                    available: false,
                },
            } as unknown as UserSetting
            const chats = {
                tickets: [
                    {
                        id: 1,
                    },
                ],
            }
            mockServer
                .onPost('/api/users/0/settings/')
                .reply(200, {...newSetting, id: 1})
            mockServer.onGet('/api/activity/chats/').reply(200, chats)
            return store
                .dispatch(actions.submitSetting(newSetting, false))
                .then(() => {
                    setTimeout(() => {
                        expect(store.getActions()).toMatchSnapshot()
                        done()
                    }, 1)
                })
        })
    })

    describe('toggleActiveStatus()', () => {
        it.each([true, false])('should dispatch with status', (status) => {
            const expectedActions = [
                {
                    type: types.TOGGLE_ACTIVE_STATUS,
                    status,
                },
            ]
            store.dispatch(actions.toggleActiveStatus(status))
            expect(store.getActions()).toEqual(expectedActions)
        })

        it('should not dispatch when the status is the same', () => {
            store = mockStore({
                currentUser: initialState.set('is_active', true),
            })
            store.dispatch(actions.toggleActiveStatus(true))
            expect(store.getActions()).toEqual([])
        })
    })

    describe('update2FAEnabled', () => {
        it.each([true, false])('should dispatch with status', (status) => {
            store = mockStore({
                currentUser: initialState.set('has_2fa_enabled', !status),
            })

            store.dispatch(actions.update2FAEnabled(status))

            expect(store.getActions()).toMatchSnapshot()
        })

        it('should dispatch when the status is the same', () => {
            store = mockStore({
                currentUser: initialState.set('has_2fa_enabled', true),
            })

            store.dispatch(actions.update2FAEnabled(true))

            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('submitSettingSuccess', () => {
        it('should dispatch the next setting', () => {
            store = mockStore({
                currentUser: initialState.set('is_active', true),
            })
            const req = {
                data: {
                    1: {
                        hide: false,
                        display_order: 2,
                    },
                },
                id: 1,
                type: UserSettingType.TicketViews,
            } as unknown as UserSetting
            store.dispatch(actions.submitSettingSuccess(req, true))
            expect(store.getActions()).toMatchSnapshot()
        })
    })
})
