import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'

import moment from 'moment'
import mockDate from 'mockdate'
import {UserSetting, UserSettingType} from 'config/types/user'
import client from 'models/api/resources'
import {StoreDispatch} from 'state/types'
import history from 'pages/history'
import * as notificationActions from 'state/notifications/actions'
import * as actions from '../actions'
import {initialState} from '../reducers'
import * as types from '../constants'
import {OPEN_TWO_FA_MODAL_URL, TWO_FA_REQUIRED_AFTER_DAYS} from '../constants'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('state/notifications/actions', () => {
    return {
        notify: jest.fn(() => (args: unknown) => args),
    }
})

describe('current user actions', () => {
    let store: MockStoreEnhanced<unknown, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        jest.clearAllMocks()
        store = mockStore({
            currentUser: initialState,
            notifications: [],
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

    describe('setIsAvailable()', () => {
        it.each([true, false])('should dispatch with status', (status) => {
            store.dispatch(actions.setIsAvailable(status))

            expect(store.getActions()).toMatchSnapshot()
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

    describe('handle2FAEnforced()', () => {
        it('should redirect to the 2fa page with 2fa setup modal open and non-dismissible', () => {
            mockDate.set(new Date('2022-05-12'))

            store = mockStore({
                currentUser: fromJS({
                    has_2fa_enabled: false,
                }),
                currentAccount: fromJS({
                    settings: [
                        {
                            type: 'access',
                            data: {
                                two_fa_enforced_datetime: moment()
                                    .subtract(
                                        TWO_FA_REQUIRED_AFTER_DAYS,
                                        'days'
                                    )
                                    .toString(),
                            },
                        },
                    ],
                }),
                notifications: [],
            })

            store.dispatch(actions.handle2FAEnforced())

            expect(store.getActions().length).toEqual(0)

            jest.spyOn(history, 'push')
            expect(history.push).toHaveBeenCalledWith(OPEN_TWO_FA_MODAL_URL)

            mockDate.reset()
        })

        it('should display the banner', () => {
            mockDate.set(new Date('2022-05-12'))

            store = mockStore({
                currentUser: fromJS({
                    has_2fa_enabled: false,
                }),
                currentAccount: fromJS({
                    settings: [
                        {
                            type: 'access',
                            data: {
                                two_fa_enforced_datetime: moment().toString(),
                            },
                        },
                    ],
                }),
                notifications: [],
            })

            const notify = jest.spyOn(notificationActions, 'notify')

            store.dispatch(actions.handle2FAEnforced())

            expect(notify.mock.calls).toMatchSnapshot()

            mockDate.reset()
        })
    })
})
