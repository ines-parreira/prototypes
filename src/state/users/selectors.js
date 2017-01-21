import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

export const getUsersState = state => state.users || fromJS({})

export const getLoading = createSelector(
    [getUsersState],
    state => state.getIn(['_internal', 'loading'], fromJS({}))
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = name => createSelector(
    [getLoading],
    loading => loading.get(name, false)
)

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading = state => name => isLoading(name)(state)

export const getUsers = createSelector(
    [getUsersState],
    state => state.get('items', fromJS([]))
)

export const getActiveUser = createSelector(
    [getUsersState],
    state => state.get('active') || fromJS({})
)

export const getActiveUserId = createSelector(
    [getActiveUser],
    activeUser => activeUser.get('id')
)

export const getAgents = createSelector(
    [getUsersState],
    state => state.get('agents', fromJS([]))
)
