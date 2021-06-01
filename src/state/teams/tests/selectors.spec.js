import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors.ts'
import {initialState} from '../reducers.ts'

jest.addMatchers(immutableMatchers)

describe('teams selectors', () => {
    let state

    beforeEach(() => {
        state = {
            teams: initialState.mergeDeep({
                all: {
                    1: {id: 1, name: 'Team 1'},
                    2: {id: 2, name: 'Team 2'},
                },
            }),
        }
    })

    it('getState()', () => {
        expect(selectors.getState(state)).toEqualImmutable(state.teams)
        expect(selectors.getState({})).toEqualImmutable(fromJS({}))
    })

    it('getTeams()', () => {
        expect(selectors.getTeams(state)).toEqualImmutable(
            state.teams.get('all').valueSeq()
        )
        expect(selectors.getTeams({})).toEqualImmutable(fromJS([]))
    })
})
