import {fromJS, List, Map} from 'immutable'
import {createSelector} from 'reselect'

import {createImmutableSelector} from '../../utils.js'
import {RootState} from '../types'

import {TeamsState} from './types'

const typeSafeCreateImmutable = createImmutableSelector as typeof createSelector

export const getState = (state: RootState) =>
    (state.teams || fromJS({})) as TeamsState

export const getTeams = typeSafeCreateImmutable<
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
