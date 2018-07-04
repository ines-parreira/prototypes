import type {Map} from 'immutable'
// @flow
import {fromJS} from 'immutable'
import {createSelector} from 'reselect'
import type {stateType} from '../types'

export const getUsersState = (state: stateType) => state.users || fromJS({})

export const getLoading = createSelector(
    [getUsersState],
    (state: Map<*,*>) => state.getIn(['_internal', 'loading']) || fromJS({})
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = (name: string) => createSelector(
    [getLoading],
    (loading: Map<*,*>) => loading.get(name, false)
)

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading = (state: stateType) => (name: string): boolean => isLoading(name)(state)

export const getUsers = createSelector(
    [getUsersState],
    (state: Map<*,*>) => state.get('items') || fromJS([])
)

export const getActiveUser = createSelector(
    [getUsersState],
    (state: Map<*,*>) => state.get('active') || fromJS({})
)

export const getActiveUserId = createSelector(
    [getActiveUser],
    (activeUser: Map<*,*>) => activeUser.get('id')
)

export const getActiveUserIntegrationData = createSelector(
    [getActiveUser],
    (activeUser: Map<*,*>) => activeUser.get('integrations') || fromJS([])
)

export const getActiveUserIntegrationDataByIntegrationId = (integrationId: string) => createSelector(
    [getActiveUserIntegrationData],
    (data: Map<*,*>) => data.get(String(integrationId)) || fromJS({})
)

