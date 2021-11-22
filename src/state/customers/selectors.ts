import {fromJS, Map, List} from 'immutable'
import {createSelector} from 'reselect'

import {RootState} from '../types'

import {CustomersState} from './types'

export const getCustomersState = (state: RootState) =>
    state.customers || fromJS({})

export const getLoading = createSelector<
    RootState,
    Map<any, any>,
    CustomersState
>(
    getCustomersState,
    (state: CustomersState) =>
        (state.getIn(['_internal', 'loading']) as Map<any, any>) || fromJS({})
)

export const getCustomerHistory = createSelector<
    RootState,
    Map<any, any>,
    CustomersState
>(
    getCustomersState,
    (state: CustomersState) =>
        (state.get('customerHistory') as Map<any, any>) || fromJS({})
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = (name: string) =>
    createSelector<RootState, boolean, Map<any, any>>(
        getLoading,
        (loading: Map<any, any>) => loading.get(name, false) as boolean
    )

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading =
    (state: RootState) =>
    (name: string): boolean =>
        isLoading(name)(state)

export const getCustomers = createSelector<
    RootState,
    List<any>,
    CustomersState
>(
    getCustomersState,
    (state: CustomersState) => (state.get('items') as List<any>) || fromJS([])
)

export const getActiveCustomer = createSelector<
    RootState,
    Map<any, any>,
    CustomersState
>(
    getCustomersState,
    (state: CustomersState) =>
        (state.get('active') as Map<any, any>) || fromJS({})
)

export const getActiveCustomerId = createSelector<
    RootState,
    Maybe<number>,
    Map<any, any>
>(
    getActiveCustomer,
    (activeCustomer: Map<any, any>) => activeCustomer.get('id') as Maybe<number>
)

export const getActiveCustomerIntegrationData = createSelector<
    RootState,
    List<any>,
    Map<any, any>
>(
    getActiveCustomer,
    (activeCustomer: Map<any, any>) =>
        (activeCustomer.get('integrations') as List<any>) || fromJS([])
)

export const getActiveCustomerIntegrationDataByIntegrationId = (
    integrationId: string
) =>
    createSelector<RootState, Map<any, any>, List<any>>(
        getActiveCustomerIntegrationData,
        (data: List<any>) =>
            (data.get(String(integrationId) as unknown as number) as Map<
                any,
                any
            >) || fromJS({})
    )
