import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'
import * as types from '../constants'
import reducer, {initialState} from '../reducers'
import {currentUser, userSetting} from '../../../fixtures/user'

jest.addMatchers(immutableMatchers)

describe('reducers', () => {
    describe('currentUser', () => {
        it('should return the initial state', () => {
            expect(reducer(undefined, {})).toEqualImmutable(initialState)
        })

        it('should handle SUBMIT_SETTING_START', () => {
            const action = {
                type: types.SUBMIT_SETTING_START
            }
            const expectedState = initialState.setIn(['_internal', 'loading'], true)

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle SUBMIT_SETTING_ERROR', () => {
            const action = {
                type: types.SUBMIT_SETTING_ERROR
            }
            const expectedState = initialState.setIn(['_internal', 'loading'], false)

            expect(reducer(initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle SUBMIT_SETTING_SUCCESS (create)', () => {
            const _initialState = initialState.merge(currentUser)
            const action = {
                type: types.SUBMIT_SETTING_SUCCESS,
                isUpdate: false,
                resp: userSetting
            }
            const expectedState = _initialState
                .setIn(['_internal', 'loading'], false)
                .updateIn(['settings'], settings => settings.push(fromJS(action.resp)))

            expect(reducer(_initialState, action)).toEqualImmutable(expectedState)
        })

        it('should handle SUBMIT_SETTING_SUCCESS (update)', () => {
            const _setting = fromJS([{id: userSetting.id, type: userSetting.type}])
            const _initialState = initialState
                .merge(currentUser)
                .update('settings', settings => settings.push(_setting))
            const action = {
                type: types.SUBMIT_SETTING_SUCCESS,
                isUpdate: true,
                resp: userSetting
            }
            const expectedState = _initialState
                .setIn(['_internal', 'loading'], false)
                .updateIn(['settings'], settings => {
                    return settings.map(setting => {
                        if (setting.get('id') === action.resp.id) {
                            return setting.set('data', fromJS(action.resp.data))
                        }
                        return setting
                    })
                })

            expect(reducer(_initialState, action)).toEqualImmutable(expectedState)
        })
    })
})
