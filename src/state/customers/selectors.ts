import {fromJS, Map, List} from 'immutable'
import {createSelector} from 'reselect'

import {TicketChannel} from 'business/types/ticket'
import {RootState} from '../types'

import {Customer, CustomersState} from './types'

export const getCustomersState = (state: RootState) =>
    state.customers || fromJS({})

export const getLoading = createSelector(
    getCustomersState,
    (state: CustomersState) =>
        (state.getIn(['_internal', 'loading']) as Map<any, any>) || fromJS({})
)

export const getCustomerHistory = createSelector(
    getCustomersState,
    (state: CustomersState) =>
        (state.get('customerHistory') as Map<any, any>) || fromJS({})
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = (name: string) =>
    createSelector(
        getLoading,
        (loading: Map<any, any>) => loading.get(name, false) as boolean
    )

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading =
    (state: RootState) =>
    (name: string): boolean =>
        isLoading(name)(state)

export const getCustomers = createSelector(
    getCustomersState,
    (state: CustomersState) => (state.get('items') as List<any>) || fromJS([])
)

export const DEPRECATED_getActiveCustomer = createSelector(
    getCustomersState,
    (state: CustomersState) =>
        (state.get('active') as Map<any, any>) || fromJS({})
)

export const getActiveCustomer = createSelector(
    getCustomersState,
    (state) =>
        (state.get('active') as Map<any, any>).toJS() as
            | Customer
            | Record<string, never>
)

export const getActiveCustomerId = createSelector(
    DEPRECATED_getActiveCustomer,
    (activeCustomer: Map<any, any>) => activeCustomer.get('id') as Maybe<number>
)

export const getActiveCustomerIntegrationData = createSelector(
    DEPRECATED_getActiveCustomer,
    (activeCustomer: Map<any, any>) =>
        (activeCustomer.get('integrations') as Map<any, any>) || fromJS([])
)

export const getActiveCustomerIntegrationDataByIntegrationId = (
    integrationId: number
) =>
    createSelector(
        getActiveCustomerIntegrationData,
        (data: Map<any, any>) =>
            (data.get(integrationId.toString()) as Map<any, any>) || fromJS({})
    )

const getActiveCustomerChannels = createSelector(
    getActiveCustomer,
    (activeCustomer) =>
        activeCustomer.channels
            ?.sort((a, b) => a.address.localeCompare(b.address))
            .sort((a, b) => Number(b.preferred) - Number(a.preferred))
            .sort((a, b) => a.type.localeCompare(b.type)) || []
)

export const makeGetActiveCustomerChannelsByType = (
    channelTypes: TicketChannel[]
) =>
    createSelector(getActiveCustomerChannels, (channels) =>
        channels.filter((channel) => channelTypes.includes(channel.type))
    )
