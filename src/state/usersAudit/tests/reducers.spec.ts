import * as immutableMatchers from 'jest-immutable-matchers'

import {GorgiasAction} from '../../types'
import reducer, {initialState} from '../reducers'
import * as types from '../constants'

jest.addMatchers(immutableMatchers)

describe('users audit reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {} as GorgiasAction)).toEqualImmutable(
            initialState
        )
    })
    it('fetch user audit', () => {
        expect(
            reducer(
                initialState.mergeDeep({
                    events: [{id: 1}],
                    meta: {},
                }),
                {
                    type: types.FETCH_USERS_AUDIT_SUCCESS,
                    resp: {
                        events: [{id: 2}],
                        meta: {},
                    },
                }
            ).toJS()
        ).toMatchSnapshot()
    })
})
