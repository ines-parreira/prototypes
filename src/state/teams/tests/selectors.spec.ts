import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, List} from 'immutable'

import {RootState} from '../../types'
import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('teams selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            teams: initialState.mergeDeep({
                all: {
                    1: {id: 1, name: 'Team 1', members: []},
                    2: {id: 2, name: 'Team 2'},
                },
            }),
        } as RootState
    })

    it('getState()', () => {
        expect(selectors.getState(state)).toEqualImmutable(state.teams)
        expect(selectors.getState({} as RootState)).toEqualImmutable(fromJS({}))
    })

    it('getTeams()', () => {
        expect(selectors.getTeams(state)).toEqualImmutable(
            (state.teams.get('all') as List<any>).valueSeq()
        )
        expect(selectors.getTeams({} as RootState)).toEqualImmutable(fromJS([]))
    })

    it('getLabelledTeams()', () => {
        expect(selectors.getLabelledTeams(state)).toMatchSnapshot()
        expect(selectors.getLabelledTeams({} as RootState)).toEqualImmutable(
            fromJS([])
        )
    })
})
