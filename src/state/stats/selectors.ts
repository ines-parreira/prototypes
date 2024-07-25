import {createSelector, Selector} from 'reselect'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

import {
    LegacyStatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'
import {
    DEPRECATED_getIntegrationsByTypes,
    getMessagingAndAppIntegrations,
} from 'state/integrations/selectors'
import {Integration} from 'models/integration/types'
import {fromFiltersWithLogicalOperators} from 'state/stats/utils'
import {makeGetPlainJS} from 'utils'

import {RootState} from 'state/types'

import {STATS_STORE_INTEGRATION_TYPES} from 'state/stats/constants'
import {statsSlice} from 'state/stats/statsSlice'

export const getStats = (state: RootState) => state[statsSlice.name]

export const getStatsFilters = createSelector(
    getStats,
    (stats): LegacyStatsFilters => {
        return fromFiltersWithLogicalOperators(stats.filters)
    }
)

export const getStatsFiltersWithLogicalOperators = createSelector(
    getStats,
    (stats): StatsFiltersWithLogicalOperator => stats.filters
)

const makeMessagingStatsFilterSelector = (
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
                statsFilters.integrations?.filter((integrationId: number) =>
                    integrationsIds.includes(integrationId)
                ) || []
            )
        }
    )
}

const makeMessagingStatsFilterWithLogicalOperatorsSelector = (
    integrationsSelector: Selector<RootState, Integration[]>
) => {
    return createSelector(
        getStatsFiltersWithLogicalOperators,
        integrationsSelector,
        (statsFilters, integrations) => {
            const integrationsIds = integrations.map(
                (integration) => integration.id
            )

            return {
                operator:
                    statsFilters.integrations?.operator ||
                    LogicalOperatorEnum.ONE_OF,
                values:
                    statsFilters.integrations?.values.filter(
                        (integrationId: number) =>
                            integrationsIds.includes(integrationId)
                    ) || [],
            }
        }
    )
}

export const getStatsMessagingAndAppIntegrations = makeGetPlainJS<
    Integration[]
>(getMessagingAndAppIntegrations)

export const getMessagingAndAppIntegrationsStatsFilter =
    makeMessagingStatsFilterSelector(getStatsMessagingAndAppIntegrations)

export const getMessagingAndAppIntegrationsStatsFilterWithLogicalOperators =
    makeMessagingStatsFilterWithLogicalOperatorsSelector(
        getStatsMessagingAndAppIntegrations
    )

export const getStatsStoreIntegrations = makeGetPlainJS<Integration[]>(
    DEPRECATED_getIntegrationsByTypes(STATS_STORE_INTEGRATION_TYPES)
)

export const getStoreIntegrationsStatsFilter = makeMessagingStatsFilterSelector(
    getStatsStoreIntegrations
)

export const getSLAPoliciesStatsFilter = createSelector(
    getStatsFilters,
    (filters) => filters.slaPolicies ?? []
)

export const getPageStatsFilters = createSelector(
    getStatsFilters,
    getMessagingAndAppIntegrationsStatsFilter,
    (statsFilters, integrationsStatsFilter) => {
        const {
            channels,
            agents,
            period,
            tags,
            helpCenters,
            localeCodes,
            score,
            campaigns,
            campaignStatuses,
            slaPolicies,
        } = statsFilters
        return {
            channels,
            agents,
            period,
            ...(integrationsStatsFilter.length > 0
                ? {integrations: integrationsStatsFilter}
                : {}),
            tags,
            helpCenters,
            localeCodes,
            score,
            campaigns,
            campaignStatuses,
            slaPolicies,
        }
    }
)

export const getPageStatsFiltersWithLogicalOperators = createSelector(
    getStatsFiltersWithLogicalOperators,
    getMessagingAndAppIntegrationsStatsFilterWithLogicalOperators,
    (statsFilters, integrationsStatsFilter) => {
        const {
            channels,
            agents,
            period,
            tags,
            helpCenters,
            localeCodes,
            score,
            campaigns,
            slaPolicies,
        } = statsFilters
        return {
            channels,
            agents,
            period,
            integrations: integrationsStatsFilter,
            tags,
            helpCenters,
            localeCodes,
            score,
            campaigns,
            slaPolicies,
        }
    }
)
