import { fromJS, List, Map } from 'immutable'
import _capitalize from 'lodash/capitalize'
import { createSelector } from 'reselect'

import { createImmutableSelector, makeGetPlainJS } from '../../utils'
import { RootState } from '../types'
import { TeamsState } from './types'

export const getState = (state: RootState) =>
    (state.teams || fromJS({})) as TeamsState

export const getTeams = createImmutableSelector(
    getState,
    (state) =>
        (state.has('all')
            ? (state.get('all') as Map<any, any>).valueSeq()
            : fromJS([])) as List<Map<any, any>>,
)

export const getTeamsMinimalWithEmoji = createSelector(getTeams, (teams) =>
    teams
        .map((team) =>
            Map({
                name: team?.get('name'),
                id: team?.get('id'),
                nativeEmoji: team?.getIn(['decoration', 'emoji', 'native']),
            }),
        )
        .toList(),
)

export const getTeamsMinimalWithEmojiJS = makeGetPlainJS<
    {
        id: number
        name: string
        nativeEmoji?: string
    }[]
>(getTeamsMinimalWithEmoji)

export const getLabelledTeams = createSelector(getTeams, (teams) =>
    teams.map((team) => ({
        label: _capitalize(team?.get('name')),
        id: team?.get('id'),
        members: (team?.get('members', fromJS([])) as List<any>)
            .map((user: Map<any, any>) => user.get('id') as number)
            .toJS(),
    })),
)

export const getLabelledTeamsWithMembers = createSelector(
    getLabelledTeams,
    (teams) =>
        teams
            .map((team) => ({
                ...team,
                value: `${team?.id}`,
            }))
            .toList(),
)

export const getLabelledTeamsJS =
    makeGetPlainJS<{ id: number; label: string; members: number[] }[]>(
        getLabelledTeams,
    )

export const getFilterTeamsJS = makeGetPlainJS<
    { value: string; label: string; members: number[] }[]
>(getLabelledTeamsWithMembers)
