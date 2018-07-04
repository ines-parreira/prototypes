import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('users selectors', () => {
    let state

    beforeEach(() => {
        state = {
            users: initialState
                .mergeDeep({
                    active: {id: 1},
                    items: [{id: 1}, {id: 2}],
                    _internal: {
                        loading: {
                            loader1: true,
                            loader2: false,
                        },
                    },
                })
        }
    })

    it('getUsersState', () => {
        expect(selectors.getUsersState(state)).toEqualImmutable(state.users)
        expect(selectors.getUsersState({})).toEqualImmutable(fromJS({}))
    })

    it('getLoading', () => {
        expect(selectors.getLoading(state)).toEqualImmutable(state.users.getIn(['_internal', 'loading']))
        expect(selectors.getLoading({})).toEqualImmutable(fromJS({}))
    })

    it('isLoading', () => {
        expect(selectors.isLoading('loader1')(state)).toBe(true)
        expect(selectors.isLoading('loader2')(state)).toBe(false)
        expect(selectors.isLoading('unknown')(state)).toBe(false)
    })

    it('getUsers', () => {
        expect(selectors.getUsers(state)).toEqualImmutable(state.users.get('items'))
        expect(selectors.getUsers({})).toEqualImmutable(fromJS([]))
    })

    it('getActiveUser', () => {
        expect(selectors.getActiveUser(state)).toEqualImmutable(state.users.get('active'))
        expect(selectors.getActiveUser({})).toEqualImmutable(fromJS({}))
    })

    it('getActiveUserId', () => {
        expect(selectors.getActiveUserId(state)).toEqualImmutable(state.users.getIn(['active', 'id']))
        expect(selectors.getActiveUserId({})).toBe(undefined)
    })
})
