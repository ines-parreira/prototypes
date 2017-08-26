import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors'
import {initialState} from '../reducers'
import * as usersFixtures from '../../../fixtures/users'

import {DEFAULT_PREFERENCES} from './../../../config'

jest.addMatchers(immutableMatchers)

describe('current user selectors', () => {
    let state

    beforeEach(() => {
        state = {
            currentUser: initialState.mergeDeep(fromJS(usersFixtures.currentUser)),
        }
    })

    it('getCurrentUserState', () => {
        expect(selectors.getCurrentUserState(state)).toEqualImmutable(state.currentUser)
        expect(selectors.getCurrentUserState({})).toEqualImmutable(fromJS({}))
    })

    it('getCurrentUser', () => {
        expect(selectors.getCurrentUser(state)).toEqualImmutable(state.currentUser)
        expect(selectors.getCurrentUser({})).toEqualImmutable(fromJS({}))
    })

    it('getSettings', () => {
        expect(selectors.getSettings(state)).toEqualImmutable(state.currentUser.get('settings'))
        expect(selectors.getSettings({})).toEqualImmutable(fromJS([]))
    })

    it('getSettingsByType', () => {
        expect(selectors.getSettingsByType('ticket-views')(state)).toEqualImmutable(state.currentUser.get('settings').first())
        expect(
            selectors.getSettingsByType('ticket-views')({
                ...state,
                views: fromJS({
                    items: [{
                        id: 100,
                        display_order: 100,
                    }],
                }),
            }).get('data')
        ).toEqualImmutable(
            state.currentUser.get('settings').first().get('data').set('100', fromJS({
                hide: false,
                display_order: 100,
            }))
        )
    })

    it('getApiKey', () => {
        expect(selectors.getApiKey(state)).toBe(state.currentUser.getIn(['auths', 0, 'data', 'token']))
        expect(selectors.getApiKey({})).toBe('')
    })

    it('getPreferences', () => {
        expect(selectors.getPreferences(state)).toEqualImmutable(state.currentUser.get('settings').last())
        expect(selectors.getPreferences({})).toEqualImmutable(fromJS({
            type: 'preferences',
            data: DEFAULT_PREFERENCES
        }))
    })

    it('isAvailableForChat', () => {
        expect(selectors.isAvailableForChat(state)).toBe(true)
        expect(selectors.isAvailableForChat({})).toBe(true)
    })

    it('isHidingTips', () => {
        expect(selectors.isHidingTips(state)).toBe(true)
        expect(selectors.isHidingTips({})).toBe(false)
    })
})
