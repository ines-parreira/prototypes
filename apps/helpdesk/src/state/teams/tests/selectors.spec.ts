import type { List } from 'immutable'
import { fromJS } from 'immutable'

import type { RootState } from 'state/types'

import { initialState } from '../reducers'
import * as selectors from '../selectors'

describe('teams selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            teams: initialState.mergeDeep({
                all: {
                    1: { id: 1, name: 'Team 1', members: [] },
                    2: { id: 2, name: 'Team 2' },
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
            (state.teams.get('all') as List<any>).valueSeq(),
        )
        expect(selectors.getTeams({} as RootState)).toEqualImmutable(fromJS([]))
    })

    it('getLabelledTeams()', () => {
        expect(selectors.getLabelledTeams(state)).toMatchSnapshot()
        expect(selectors.getLabelledTeams({} as RootState)).toEqualImmutable(
            fromJS([]),
        )
    })

    describe('getLabelledTeamsJS', () => {
        it('should return labelled teams from the state', () => {
            expect(selectors.getLabelledTeamsJS(state)).toEqual([
                { id: 1, label: 'Team 1', members: [] },
                { id: 2, label: 'Team 2', members: [] },
            ])
        })

        it('should return an empty array when no teams in the state', () => {
            expect(selectors.getLabelledTeamsJS({} as RootState)).toEqual([])
        })
    })

    describe('getTeamsMinimalWithEmoji & getTeamsMinimalWithEmojiJS', () => {
        const state = {
            teams: initialState.mergeDeep({
                all: {
                    1: {
                        id: 1,
                        name: 'Team 1',
                        decoration: { emoji: { native: '😀' } },
                    },
                    2: {
                        id: 2,
                        name: 'Team 2',
                        decoration: { emoji: { native: '😃' } },
                    },
                },
            }),
        } as RootState

        it('should return minimal teams from the state', () => {
            expect(selectors.getTeamsMinimalWithEmoji(state)).toEqualImmutable(
                fromJS([
                    { id: 1, name: 'Team 1', nativeEmoji: '😀' },
                    { id: 2, name: 'Team 2', nativeEmoji: '😃' },
                ]),
            )
        })

        it('should return minimal teams as JS from the state', () => {
            expect(selectors.getTeamsMinimalWithEmojiJS(state)).toEqual([
                { id: 1, name: 'Team 1', nativeEmoji: '😀' },
                { id: 2, name: 'Team 2', nativeEmoji: '😃' },
            ])
        })

        it('should return an empty array when no teams in the state', () => {
            expect(
                selectors.getTeamsMinimalWithEmoji({} as RootState),
            ).toEqualImmutable(fromJS([]))
        })

        it('should return an empty array as JS when no teams in the state', () => {
            expect(
                selectors.getTeamsMinimalWithEmojiJS({} as RootState),
            ).toEqual([])
        })
    })
})
