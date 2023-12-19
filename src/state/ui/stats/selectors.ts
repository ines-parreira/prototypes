import {createSelector} from '@reduxjs/toolkit'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'
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
