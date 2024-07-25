import {createSelector} from '@reduxjs/toolkit'
import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'
import {getTimezone} from 'state/currentUser/selectors'
import {
    getPageStatsFilters,
    getStatsStoreIntegrations,
    getStoreIntegrationsStatsFilter,
} from 'state/stats/selectors'
import {RootState} from 'state/types'
import {periodToReportingGranularity} from 'utils/reporting'

export const isCleanStatsDirty = (state: RootState) =>
    state.ui.stats.isFilterDirty

export const getCleanStatsFilters = (state: RootState) =>
    state.ui.stats.cleanStatsFilters

export const getCleanStatsFiltersWithTimezone = createSelector(
    getCleanStatsFilters,
    getPageStatsFilters,
    getTimezone,
    (cleanStatsFilters, pageStatsFilters, timezone) => {
        return {
            userTimezone: timezone || DEFAULT_TIMEZONE,
            cleanStatsFilters: cleanStatsFilters || pageStatsFilters,
            granularity: periodToReportingGranularity(
                cleanStatsFilters?.period || pageStatsFilters?.period
            ),
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
