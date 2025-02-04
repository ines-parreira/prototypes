import {createSelector} from '@reduxjs/toolkit'

import {FilterKey} from 'models/stat/types'
import {SAVEABLE_FILTERS} from 'pages/stats/common/filters/constants'
import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'
import {getTimezone} from 'state/currentUser/selectors'
import {
    getPageStatsFilters,
    getPageStatsFiltersWithLogicalOperators,
    getStatsStoreIntegrations,
    getStoreIntegrationsStatsFilter,
} from 'state/stats/selectors'
import {
    excludeFromFiltersWithLogicalOperators,
    fromFiltersWithLogicalOperators,
    statsFiltersWithLogicalOperatorsFromSavedFilters,
} from 'state/stats/utils'
import {RootState} from 'state/types'
import {
    getIsSavedFilterApplied,
    getSavedFilterDraft,
} from 'state/ui/stats/filtersSlice'
import {periodAndAggregationWindowToReportingGranularity} from 'utils/reporting'

export const isCleanStatsDirty = (state: RootState) =>
    state.ui.stats.filters.isFilterDirty

export const getCleanStatsFilters = (state: RootState) =>
    state.ui.stats.filters.cleanStatsFilters

export const getCleanStatsFiltersWithTimezone = createSelector(
    getCleanStatsFilters,
    getPageStatsFilters,
    getTimezone,
    (cleanStatsFilters, pageStatsFilters, timezone) => {
        const legacyCleanStatsFilters =
            cleanStatsFilters !== null
                ? fromFiltersWithLogicalOperators(cleanStatsFilters)
                : pageStatsFilters
        return {
            userTimezone: timezone || DEFAULT_TIMEZONE,
            cleanStatsFilters: legacyCleanStatsFilters,
            granularity: periodAndAggregationWindowToReportingGranularity(
                legacyCleanStatsFilters.period,
                legacyCleanStatsFilters[FilterKey.AggregationWindow]
            ),
        }
    }
)

export const getCleanStatsFiltersWithLogicalOperators = createSelector(
    getCleanStatsFilters,
    getPageStatsFiltersWithLogicalOperators,
    (cleanStatsFilters, pageStatsFilters) =>
        cleanStatsFilters || pageStatsFilters
)

export const getCleanStatsFiltersWithLogicalOperatorsWithTimezone =
    createSelector(
        getCleanStatsFiltersWithLogicalOperators,
        getTimezone,
        getIsSavedFilterApplied,
        getSavedFilterDraft,
        (statsFilters, timezone, isSavedFilterApplied, savedFilterDraft) => {
            let filters = statsFilters
            if (isSavedFilterApplied) {
                const filtersNotSupportedBySavedFilters =
                    excludeFromFiltersWithLogicalOperators(
                        statsFilters,
                        SAVEABLE_FILTERS
                    )
                filters = {
                    ...filtersNotSupportedBySavedFilters,
                    ...statsFiltersWithLogicalOperatorsFromSavedFilters(
                        savedFilterDraft?.filter_group ?? []
                    ),
                }
            }
            return {
                userTimezone: timezone || DEFAULT_TIMEZONE,
                cleanStatsFilters: filters,
                granularity: periodAndAggregationWindowToReportingGranularity(
                    statsFilters.period,
                    statsFilters[FilterKey.AggregationWindow]
                ),
            }
        }
    )

export const getStatsFiltersFromSavedFilters = createSelector(
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getSavedFilterDraft,
    (statsFilters, savedFilterDraft) => {
        const filtersFromSavedFilter =
            statsFiltersWithLogicalOperatorsFromSavedFilters(
                savedFilterDraft?.filter_group ?? []
            )
        return {
            period: statsFilters.cleanStatsFilters.period,
            ...filtersFromSavedFilter,
        }
    }
)

export const getCleanStatsFiltersWithInitialStoreIntegration = createSelector(
    getCleanStatsFiltersWithTimezone,
    getStatsStoreIntegrations,
    getStoreIntegrationsStatsFilter,
    (statsFilters, storeIntegrations, storeStatsFilter) => {
        const {channels, tags, period, campaigns} =
            statsFilters.cleanStatsFilters

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
