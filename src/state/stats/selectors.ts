import {Map} from 'immutable'
import {createSelector, Selector} from 'reselect'

import {StatsFilters} from 'models/stat/types'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {Integration} from 'models/integration/types'
import {makeGetPlainJS} from 'utils'

import {RootState} from '../types'

import {
    STATS_MESSAGING_INTEGRATIONS_TYPES,
    STATS_STORE_INTEGRATION_TYPES,
} from './constants'

export const getStatsFilters = createSelector(
    (state: RootState) => state.stats,
    (stats): StatsFilters => {
        return (stats.get('filters') as Map<any, any>).toJS() as StatsFilters
    }
)

const makeIntegrationsStatsFilterSelector = (
    integrationsSelector: Selector<RootState, Integration[]>
) => {
    return createSelector(
        getStatsFilters,
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
