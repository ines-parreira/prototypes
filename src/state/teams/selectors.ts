import {fromJS, List, Map} from 'immutable'

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
