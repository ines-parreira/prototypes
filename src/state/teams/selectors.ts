import {fromJS, List, Map} from 'immutable'
import {createSelector} from 'reselect'
import _capitalize from 'lodash/capitalize'

import {createImmutableSelector} from '../../utils'
import {RootState} from '../types'

import {TeamsState} from './types'

export const getState = (state: RootState) =>
    (state.teams || fromJS({})) as TeamsState

export const getTeams = createImmutableSelector<
    RootState,
    List<any>,
    TeamsState
>(
    getState,
    (state) =>
        (state.has('all')
            ? (state.get('all') as Map<any, any>).valueSeq()
            : fromJS([])) as List<any>
)

export const getLabelledTeams = createSelector<RootState, List<any>, List<any>>(
    getTeams,
    (teams) =>
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
