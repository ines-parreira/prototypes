import {fromJS, List, Map, Seq} from 'immutable'
import {createSelector} from 'reselect'
import _capitalize from 'lodash/capitalize'

import {createImmutableSelector, makeGetPlainJS} from '../../utils'
import {RootState} from '../types'

import {TeamsState} from './types'

export const getState = (state: RootState) =>
    (state.teams || fromJS({})) as TeamsState

export const getTeams = createImmutableSelector<
    RootState,
    List<Map<any, any>> | Seq.Indexed<Map<any, any>>,
    TeamsState
>(
    getState,
    (state) =>
        (state.has('all')
            ? (state.get('all') as Map<any, any>).valueSeq()
            : fromJS([])) as List<any>
)

export const getLabelledTeams = createSelector<
    RootState,
    List<any>,
    List<any> | Seq.Indexed<any>
>(getTeams, (teams) =>
    teams
        .map((team: Map<any, any>) => ({
            label: _capitalize(team.get('name')),
            id: team.get('id'),
            members: (team.get('members', fromJS([])) as List<any>)
                .map((user: Map<any, any>) => user.get('id') as number)
                .toJS(),
        }))
        .toList()
)

export const getLabelledTeamsJS =
    makeGetPlainJS<{id: number; label: string; members: string[]}[]>(
        getLabelledTeams
    )
