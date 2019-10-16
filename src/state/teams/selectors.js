// @flow
import {fromJS} from 'immutable'

import {createImmutableSelector} from '../../utils'
import type {stateType} from '../types'

export const getState = (state: stateType) => state.teams || fromJS({})

export const getTeams = createImmutableSelector(
    [getState],
    (state) => state.has('all')
        ? state.get('all').valueSeq()
        : fromJS([])
)
