import type {Map} from 'immutable'
// @flow
import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

import type {stateType} from '../types'

export const getCustomersState = (state: stateType) =>
    state.customers || fromJS({})

export const getLoading = createSelector(
    [getCustomersState],
    (state: Map<*, *>) => state.getIn(['_internal', 'loading']) || fromJS({})
)

export const getCustomerHistory = createSelector(
    [getCustomersState],
    (state: Map<*, *>) => state.get('customerHistory') || fromJS({})
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = (name: string) =>
    createSelector([getLoading], (loading: Map<*, *>) =>
        loading.get(name, false)
    )

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading = (state: stateType) => (name: string): boolean =>
    isLoading(name)(state)

export const getCustomers = createSelector(
    [getCustomersState],
    (state: Map<*, *>) => state.get('items') || fromJS([])
)

export const getActiveCustomer = createSelector(
    [getCustomersState],
    (state: Map<*, *>) => state.get('active') || fromJS({})
)

export const getActiveCustomerId = createSelector(
    [getActiveCustomer],
    (activeCustomer: Map<*, *>) => activeCustomer.get('id')
)

export const getActiveCustomerIntegrationData = createSelector(
    [getActiveCustomer],
    (activeCustomer: Map<*, *>) =>
        activeCustomer.get('integrations') || fromJS([])
)

export const getActiveCustomerIntegrationDataByIntegrationId = (
    integrationId: string
) =>
    createSelector(
        [getActiveCustomerIntegrationData],
        (data: Map<*, *>) => data.get(String(integrationId)) || fromJS({})
    )
