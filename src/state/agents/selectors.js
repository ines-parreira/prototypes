// @flow
import {fromJS} from 'immutable'
import {createImmutableSelector} from '../../utils'

// types
import type {stateType} from '../types'

export const getState = (state: stateType) => state.agents || fromJS({})

export const getPaginatedAgents = createImmutableSelector(
    [getState],
    state => state.getIn(['pagination', 'data']) || fromJS([])
)

export const getPagination = createImmutableSelector(
    [getState],
    state => state.getIn(['pagination', 'meta']) || fromJS({})
)
