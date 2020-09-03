import * as immutableMatchers from 'jest-immutable-matchers'

import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers.ts'
import * as constants from '../constants'

jest.addMatchers(immutableMatchers)

describe('teams reducers', () => {
    const team = {id: 1, name: 'Team 1'}

    it('initial state', () => {
        expect(reducer(undefined, {})).toEqualImmutable(initialState)
    })

    it('should add the created team when action type is CREATE_TEAM_SUCCESS', () => {
        expect(
            reducer(initialState, {
                type: constants.CREATE_TEAM_SUCCESS,
                payload: team,
            })
        ).toMatchSnapshot()
    })

    it('should update the updated team when action type is UPDATE_TEAM_SUCCESS', () => {
        expect(
            reducer(initialState, {
                type: constants.UPDATE_TEAM_SUCCESS,
                payload: team,
            })
        ).toMatchSnapshot()
    })

    it('should update the fetched team when action type is FETCH_TEAM_SUCCESS', () => {
        expect(
            reducer(initialState, {
                type: constants.FETCH_TEAM_SUCCESS,
                payload: team,
            })
        ).toMatchSnapshot()
    })

    it('should delete the deleted team when action type is DELETE_TEAM_SUCCESS', () => {
        const state = initialState.setIn(
            ['all', team.id.toString()],
            fromJS(team)
        )

        expect(
            reducer(state, {
                type: constants.DELETE_TEAM_SUCCESS,
                payload: team.id,
            })
        ).toMatchSnapshot()
    })
})
