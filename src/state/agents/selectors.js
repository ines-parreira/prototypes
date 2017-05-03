import {fromJS} from 'immutable'
import {createImmutableSelector} from '../../utils'

export const getState = state => state.agents || fromJS({})

export const getPaginatedAgents = createImmutableSelector(
    [getState],
    state => state.getIn(['pagination', 'data']) || fromJS([])
)

export const getPagination = createImmutableSelector(
    [getState],
    state => state.getIn(['pagination', 'meta']) || fromJS({})
)
