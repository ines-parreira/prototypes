import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as userTypes from '../../users/constants'
import * as types from '../constants'

jest.addMatchers(immutableMatchers)

window.Raven = {
    setUserContext: jest.fn(),
}

describe('current user reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {})).toEqualImmutable(initialState)
    })

    it('fetch current user', () => {
        // start
        expect(
            reducer(
                initialState,
                {
                    type: userTypes.FETCH_CURRENT_USER_START,
                }
            ).toJS()
        ).toMatchSnapshot()

        // success
        expect(
            reducer(
                initialState,
                {
                    type: userTypes.FETCH_CURRENT_USER_SUCCESS,
                    resp: {
                        id: 1,
                        name: 'Alex',
                        email: 'alex@gorgias.io',
                    },
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('submit current user', () => {
        // start
        expect(
            reducer(
                initialState,
                {
                    type: userTypes.SUBMIT_CURRENT_USER_START,
                }
            ).toJS()
        ).toMatchSnapshot()

        // success
        expect(
            reducer(
                initialState,
                {
                    type: userTypes.SUBMIT_CURRENT_USER_SUCCESS,
                    resp: {
                        id: 1,
                        name: 'Alex',
                        email: 'alex@gorgias.io',
                    },
                }
            ).toJS()
        ).toMatchSnapshot()

        // fail
        expect(
            reducer(
                initialState,
                {
                    type: userTypes.SUBMIT_CURRENT_USER_ERROR,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('submit setting', () => {
        // start
        expect(
            reducer(
                initialState,
                {
                    type: types.SUBMIT_SETTING_START,
                    settingType: 'view',
                }
            ).toJS()
        ).toMatchSnapshot()

        // success
        expect(
            reducer(
                initialState,
                {
                    type: types.SUBMIT_SETTING_SUCCESS,
                    settingType: 'view',
                    resp: {
                        data: {value: 1},
                    },
                }
            ).toJS()
        ).toMatchSnapshot()

        // success update
        expect(
            reducer(
                initialState
                    .mergeDeep(fromJS({
                        settings: [{id: 1, data: {value: 2}}],
                    })),
                {
                    type: types.SUBMIT_SETTING_SUCCESS,
                    settingType: 'view',
                    isUpdate: true,
                    resp: {
                        id: 1,
                        data: {value: 1},
                    },
                }
            ).toJS()
        ).toMatchSnapshot()

        // fail
        expect(
            reducer(
                initialState,
                {
                    type: types.SUBMIT_SETTING_ERROR,
                    settingType: 'view',
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('change password', () => {
        // start
        expect(
            reducer(
                initialState,
                {
                    type: types.CHANGE_PASSWORD_START,
                }
            ).toJS()
        ).toMatchSnapshot()

        // success
        expect(
            reducer(
                initialState,
                {
                    type: types.CHANGE_PASSWORD_SUCCESS,
                    resp: {
                        id: 1,
                        name: 'Alex',
                        email: 'alex@gorgias.io',
                    },
                }
            ).toJS()
        ).toMatchSnapshot()

        // fail
        expect(
            reducer(
                initialState,
                {
                    type: types.CHANGE_PASSWORD_ERROR,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    describe('should handle TOGGLE_ACTIVE_STATUS', () => {
        it('without status', () => {
            const action = {
                type: types.TOGGLE_ACTIVE_STATUS,
            }
            expect(reducer(initialState, action))
                .toEqualImmutable(initialState.set('is_active', true))
            expect(reducer(initialState.set('is_active', true), action))
                .toEqualImmutable(initialState.set('is_active', false))
        })

        it('with status', () => {
            const action = {
                type: types.TOGGLE_ACTIVE_STATUS,
                status: false
            }
            expect(reducer(initialState, action))
                .toEqualImmutable(initialState.set('is_active', false))
            expect(reducer(initialState, {...action, status: true}))
                .toEqualImmutable(initialState.set('is_active', true))
        })
    })
})
