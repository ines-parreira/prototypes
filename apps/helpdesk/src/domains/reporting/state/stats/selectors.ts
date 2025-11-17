import type { Selector } from 'reselect'
import { createSelector } from 'reselect'

import type {
    CustomFieldSavedFilter,
    LegacyStatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { STATS_STORE_INTEGRATION_TYPES } from 'domains/reporting/state/stats/constants'
import { statsSlice } from 'domains/reporting/state/stats/statsSlice'
import {
    fromFiltersWithLogicalOperators,
    isCustomFieldSavedFilter,
    statsFiltersWithLogicalOperatorsFromSavedFilters,
} from 'domains/reporting/state/stats/utils'
import { getSavedFilterDraft } from 'domains/reporting/state/ui/stats/filtersSlice'
import type { Integration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { getHasAutomate } from 'state/billing/selectors'
import {
    DEPRECATED_getIntegrationsByTypes,
    getIntegrationsByTypes,
    getMessagingAndAppIntegrations,
} from 'state/integrations/selectors'
import type { RootState } from 'state/types'
import { makeGetPlainJS } from 'utils'

export const getStats = (state: RootState) => state[statsSlice.name]

export const getStatsFilters = createSelector(
    getStats,
    (stats): LegacyStatsFilters => {
        return fromFiltersWithLogicalOperators(stats.filters)
    },
)

export const getStatsFiltersWithLogicalOperators = createSelector(
    getStats,
    (stats): StatsFiltersWithLogicalOperator => stats.filters,
)

const makeMessagingStatsFilterSelector = (
    integrationsSelector: Selector<RootState, Integration[]>,
) => {
    return createSelector(
        getStatsFilters,
        integrationsSelector,
        (statsFilters, integrations) => {
            const integrationsIds = integrations.map(
                (integration) => integration.id,
            )
            return (
                statsFilters.integrations?.filter((integrationId: number) =>
                    integrationsIds.includes(integrationId),
                ) || []
            )
        },
    )
}

const makeMessagingStatsFilterWithLogicalOperatorsSelector = (
    integrationsSelector: Selector<RootState, Integration[]>,
) => {
    return createSelector(
        getStatsFiltersWithLogicalOperators,
        integrationsSelector,
        (statsFilters, integrations) => {
            const integrationsIds = integrations.map(
                (integration) => integration.id,
            )

            return {
                operator:
                    statsFilters.integrations?.operator ||
                    LogicalOperatorEnum.ONE_OF,
                values:
                    statsFilters.integrations?.values.filter(
                        (integrationId: number) =>
                            integrationsIds.includes(integrationId),
                    ) || [],
            }
        },
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
            : [IntegrationType.Shopify],
    )(state)

export const getMessagingAndAppIntegrationsStatsFilter =
    makeMessagingStatsFilterSelector(getStatsMessagingAndAppIntegrations)

export const getMessagingAndAppIntegrationsStatsFilterWithLogicalOperators =
    makeMessagingStatsFilterWithLogicalOperatorsSelector(
        getStatsMessagingAndAppIntegrations,
    )

export const getStatsStoreIntegrations = makeGetPlainJS<Integration[]>(
    DEPRECATED_getIntegrationsByTypes(STATS_STORE_INTEGRATION_TYPES),
)

export const getStoreIntegrationsStatsFilter = makeMessagingStatsFilterSelector(
    getStatsStoreIntegrations,
)

export const getSLAPoliciesStatsFilter = createSelector(
    getStatsFilters,
    (filters) => filters.slaPolicies ?? [],
)

export const getPageStatsFilters = createSelector(
    getStatsFilters,
    getMessagingAndAppIntegrationsStatsFilter,
    (statsFilters, integrationsStatsFilter) => {
        const { integrations: __, ...rest } = statsFilters
        return {
            ...rest,
            ...(integrationsStatsFilter.length > 0
                ? { integrations: integrationsStatsFilter }
                : {}),
        }
    },
)

export const getStatsFiltersWithInitialStoreIntegration = createSelector(
    getStatsFilters,
    getStatsStoreIntegrations,
    getStoreIntegrationsStatsFilter,
    (statsFilters, storeIntegrations, storeStatsFilter) => {
        const { channels, tags, period, campaigns } = statsFilters

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
    },
)

export const getPageStatsFiltersWithLogicalOperators = createSelector(
    getStatsFiltersWithLogicalOperators,
    getMessagingAndAppIntegrationsStatsFilterWithLogicalOperators,
    (
        statsFilters,
        integrationsStatsFilter,
    ): StatsFiltersWithLogicalOperator => {
        const { integrations: __, ...rest } = statsFilters
        return {
            ...rest,
            integrations: integrationsStatsFilter,
        }
    },
)

export const getSavedFiltersWithLogicalOperators = createSelector(
    getSavedFilterDraft,
    getStatsFiltersWithLogicalOperators,
    (savedFilterDraft, statsFilters) => {
        return {
            period: statsFilters.period,
            ...statsFiltersWithLogicalOperatorsFromSavedFilters(
                savedFilterDraft?.filter_group,
            ),
        }
    },
)

export const getCustomFieldFilterById = (customFieldId: number) =>
    createSelector(getPageStatsFiltersWithLogicalOperators, (statsFilters) => {
        const filters = statsFilters[FilterKey.CustomFields] ?? []
        return filters.find((filter) => filter.customFieldId === customFieldId)
    })

export const getCustomFieldSavedFilterById = (customFieldId: number) =>
    createSelector(getSavedFilterDraft, (savedFilterDraft) => {
        const customFieldsFilter: CustomFieldSavedFilter | undefined =
            savedFilterDraft?.filter_group.find<CustomFieldSavedFilter>(
                isCustomFieldSavedFilter,
            )

        return customFieldsFilter?.values
            .map((v) => ({ ...v, customFieldId: Number(v.custom_field_id) }))
            .find(
                (csFilter) =>
                    csFilter.custom_field_id === String(customFieldId),
            )
    })
