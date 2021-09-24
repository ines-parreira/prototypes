import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import {UserSettingType} from '../../../config/types/user.ts'
import * as selectors from '../selectors.ts'
import {initialState} from '../reducers.ts'
import * as usersFixtures from '../../../fixtures/users.ts'

import {DEFAULT_PREFERENCES} from './../../../config.ts'

jest.addMatchers(immutableMatchers)

describe('current user selectors', () => {
    let state

    beforeEach(() => {
        state = {
            currentUser: initialState.mergeDeep(fromJS(usersFixtures.user)),
        }
    })

    it('getCurrentUserState', () => {
        expect(selectors.getCurrentUserState(state)).toEqualImmutable(
            state.currentUser
        )
        expect(selectors.getCurrentUserState({})).toEqualImmutable(fromJS({}))
    })

    it('getCurrentUser', () => {
        expect(selectors.getCurrentUser(state)).toEqualImmutable(
            state.currentUser
        )
        expect(selectors.getCurrentUser({})).toEqualImmutable(fromJS({}))
    })

    it('getSettings', () => {
        expect(selectors.getSettings(state)).toEqualImmutable(
            state.currentUser.get('settings')
        )
        expect(selectors.getSettings({})).toEqualImmutable(fromJS([]))
    })

    it('getSettingsByType', () => {
        expect(
            selectors.getSettingsByType(UserSettingType.Preferences)(state)
        ).toEqualImmutable(state.currentUser.get('settings').first())
    })

    it('getPreferences', () => {
        expect(selectors.getPreferences(state)).toEqualImmutable(
            state.currentUser.get('settings').last()
        )
        expect(selectors.getPreferences({})).toEqualImmutable(
            fromJS({
                type: 'preferences',
                data: DEFAULT_PREFERENCES,
            })
        )
    })

    it('isAvailableForChat', () => {
        expect(selectors.isAvailable(state)).toBe(true)
        expect(selectors.isAvailable({})).toBe(true)
    })

    it('isHidingTips', () => {
        expect(selectors.isHidingTips(state)).toBe(true)
        expect(selectors.isHidingTips({})).toBe(false)
    })

    it('isActive', () => {
        state = {currentUser: fromJS({})}
        expect(selectors.isActive(state)).toBe(true)

        state = {currentUser: fromJS({is_active: true})}
        expect(selectors.isActive(state)).toBe(true)

        state = {currentUser: fromJS({is_active: false})}
        expect(selectors.isActive(state)).toBe(false)
    })

    it('getTimezone', () => {
        expect(selectors.getTimezone(state)).toEqualImmutable(
            state.currentUser.get('timezone')
        )
        expect(selectors.getTimezone({})).toEqualImmutable(null)
    })

    describe('makeGetSettingsByType', () => {
        it('should return setting by type', () => {
            const selector = selectors.makeGetSettingsByType()
            const settings = selector(state, UserSettingType.Preferences)
            expect(settings).toEqualImmutable(
                state.currentUser.get('settings').first()
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
