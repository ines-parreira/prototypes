import {createSelector, Selector} from 'reselect'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

import {
    FilterKey,
    LegacyStatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'
import {
    DEPRECATED_getIntegrationsByTypes,
    getIntegrationsByTypes,
    getMessagingAndAppIntegrations,
} from 'state/integrations/selectors'
import {Integration, IntegrationType} from 'models/integration/types'
import {fromFiltersWithLogicalOperators} from 'state/stats/utils'
import {makeGetPlainJS} from 'utils'

import {RootState} from 'state/types'

import {STATS_STORE_INTEGRATION_TYPES} from 'state/stats/constants'
import {statsSlice} from 'state/stats/statsSlice'
import {getHasAutomate} from 'state/billing/selectors'

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

export const getStoreIntegrations = (state: RootState) =>
    getIntegrationsByTypes(
        getHasAutomate(state)
            ? [
                  IntegrationType.Shopify,
                  IntegrationType.BigCommerce,
                  IntegrationType.Magento2,
              ]
            : [IntegrationType.Shopify]
    )(state)

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
            aggregationWindow,
            channels,
            agents,
            period,
            tags,
            helpCenters,
            localeCodes,
            score,
            campaigns,
            campaignStatuses,
            customFields,
            slaPolicies,
        } = statsFilters
        return {
            aggregationWindow,
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
            customFields,
            slaPolicies,
        }
    }
)

export const getStatsFiltersWithInitialStoreIntegration = createSelector(
    getStatsFilters,
    getStatsStoreIntegrations,
    getStoreIntegrationsStatsFilter,
    (statsFilters, storeIntegrations, storeStatsFilter) => {
        const {channels, tags, period, campaigns} = statsFilters

        return {
            statsFilters: {
                channels,
                campaigns,
                tags,
                period,
                integrations: storeStatsFilter.length
                    ? storeStatsFilter
                    : [storeIntegrations[0].id],
            },
            storeIntegrations,
        }
    }
)

export const getPageStatsFiltersWithLogicalOperators = createSelector(
    getStatsFiltersWithLogicalOperators,
    getMessagingAndAppIntegrationsStatsFilterWithLogicalOperators,
    (
        statsFilters,
        integrationsStatsFilter
    ): StatsFiltersWithLogicalOperator => {
        const {
            aggregationWindow,
            channels,
            customFields,
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
            aggregationWindow,
            channels,
            customFields,
            agents,
            period,
            integrations: integrationsStatsFilter,
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

export const getCustomFieldFilterById = (customFieldId: number) =>
    createSelector(getPageStatsFiltersWithLogicalOperators, (statsFilters) => {
        const filters = statsFilters[FilterKey.CustomFields] ?? []
        return filters.find((filter) => filter.customFieldId === customFieldId)
    })
