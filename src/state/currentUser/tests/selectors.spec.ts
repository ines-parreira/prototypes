import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, List} from 'immutable'

import {UserSettingType} from '../../../config/types/user'
import * as selectors from '../selectors'
import {initialState} from '../reducers'
import * as usersFixtures from '../../../fixtures/users'
import {DEFAULT_PREFERENCES} from '../../../config'
import {RootState} from '../../types'

jest.addMatchers(immutableMatchers)

describe('current user selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            currentUser: initialState.mergeDeep(fromJS(usersFixtures.user)),
        } as RootState
    })

    it('getCurrentUserState', () => {
        expect(selectors.getCurrentUserState(state)).toEqualImmutable(
            state.currentUser
        )
        expect(selectors.getCurrentUserState({} as RootState)).toEqualImmutable(
            fromJS({})
        )
    })

    it('getCurrentUser', () => {
        expect(selectors.getCurrentUser(state)).toEqualImmutable(
            state.currentUser
        )
        expect(selectors.getCurrentUser({} as RootState)).toEqualImmutable(
            fromJS({})
        )
    })

    it('getSettings', () => {
        expect(selectors.getSettings(state)).toEqualImmutable(
            state.currentUser.get('settings')
        )
        expect(selectors.getSettings({} as RootState)).toEqualImmutable(
            fromJS([])
        )
    })

    it('getSettingsByType', () => {
        expect(
            selectors.getSettingsByType(UserSettingType.Preferences)(state)
        ).toEqualImmutable(
            (state.currentUser.get('settings') as List<any>).first()
        )
    })

    it('getPreferences', () => {
        expect(selectors.getPreferences(state)).toEqualImmutable(
            (state.currentUser.get('settings') as List<any>).last()
        )
        expect(selectors.getPreferences({} as RootState)).toEqualImmutable(
            fromJS({
                type: 'preferences',
                data: DEFAULT_PREFERENCES,
            })
        )
    })

    it('isAvailableForChat', () => {
        expect(selectors.isAvailable(state)).toBe(true)
        expect(selectors.isAvailable({} as RootState)).toBe(true)
    })

    it('isHidingTips', () => {
        expect(selectors.isHidingTips(state)).toBe(true)
        expect(selectors.isHidingTips({} as RootState)).toBe(false)
    })

    it('isActive', () => {
        state = {currentUser: fromJS({})} as RootState
        expect(selectors.isActive(state)).toBe(true)

        state = {currentUser: fromJS({is_active: true})} as RootState
        expect(selectors.isActive(state)).toBe(true)

        state = {currentUser: fromJS({is_active: false})} as RootState
        expect(selectors.isActive(state)).toBe(false)
    })

    it('getTimezone', () => {
        expect(selectors.getTimezone(state)).toEqualImmutable(
            state.currentUser.get('timezone')
        )
        expect(selectors.getTimezone({} as RootState)).toEqualImmutable(null)
    })

    describe('makeGetSettingsByType', () => {
        it('should return setting by type', () => {
            const selector = selectors.makeGetSettingsByType()
            const settings = selector(state, UserSettingType.Preferences)
            expect(settings).toEqualImmutable(
                (state.currentUser.get('settings') as List<any>).first()
            )
        })
    })

    describe('getViewsOrderingUserSetting', () => {
        it('should return the setting by type', () => {
            const res = selectors.getViewsOrderingUserSetting({
                ...state,
                currentUser: initialState.set(
                    'settings',
                    fromJS([
                        {
                            data: {
                                foo: 'bar',
                            },
                            id: 3,
                            type: UserSettingType.ViewsOrdering,
                        },
                    ])
                ),
            })
            expect(res).toMatchSnapshot()
        })
    })
})
