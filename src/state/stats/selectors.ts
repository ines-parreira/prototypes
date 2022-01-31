import {Map} from 'immutable'
import {createSelector, Selector} from 'reselect'

import {RootState} from '../types'

import {getIntegrationsByTypes} from '../integrations/selectors'
import {Integration} from '../../models/integration/types'
import {makeGetPlainJS} from '../../utils'

import {StatsFilters, StatsState} from './types'
import {
    STATS_MESSAGING_INTEGRATIONS_TYPES,
    STATS_STORE_INTEGRATION_TYPES,
} from './constants'

export const getStatsState = (state: RootState): StatsState => state.stats

export const getFilters = createSelector<
    RootState,
    Maybe<Map<any, any>>,
    StatsState
>(getStatsState, (state) => state.get('filters') as Maybe<Map<any, any>>)

export const getStatsFiltersJS = createSelector(getFilters, (filters) =>
    filters ? (filters.toJS() as StatsFilters) : null
)

const makeIntegrationsStatsFilterSelector = (
    integrationsSelector: Selector<RootState, Integration[]>
) => {
    return createSelector(
        getStatsFiltersJS,
        integrationsSelector,
        (statsFilters, integrations) => {
            const integrationsIds = integrations.map(
                (integration) => integration.id
            )
            return (
                statsFilters?.integrations?.filter((integrationId: number) =>
                    integrationsIds.includes(integrationId)
                ) || []
            )
        }
    )
}

export const getStatsMessagingIntegrations = makeGetPlainJS<Integration[]>(
    getIntegrationsByTypes(STATS_MESSAGING_INTEGRATIONS_TYPES)
)

export const getMessagingIntegrationsStatsFilter =
    makeIntegrationsStatsFilterSelector(getStatsMessagingIntegrations)

export const getStatsStoreIntegrations = makeGetPlainJS<Integration[]>(
    getIntegrationsByTypes(STATS_STORE_INTEGRATION_TYPES)
)

export const getStoreIntegrationsStatsFilter =
    makeIntegrationsStatsFilterSelector(getStatsStoreIntegrations)
