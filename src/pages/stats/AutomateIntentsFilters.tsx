import React from 'react'

import {useCleanStatsFiltersWithLogicalOperators} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import ChannelsStatsFilter from 'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import {AUTOMATION_INTENTS_CHANNELS} from 'pages/stats/constants'
import {
    getPageStatsFiltersWithLogicalOperators,
    getStatsFilters,
} from 'state/stats/selectors'

export const AutomateIntentsFilters = () => {
    const pageStatsFiltersWithLogicalOperators = useAppSelector(
        getPageStatsFiltersWithLogicalOperators
    )
    useCleanStatsFiltersWithLogicalOperators(
        pageStatsFiltersWithLogicalOperators
    )
    const statsFilters = useAppSelector(getStatsFilters)

    return (
        <>
            <ChannelsStatsFilter
                value={statsFilters.channels}
                channelsFilter={AUTOMATION_INTENTS_CHANNELS}
            />
            <PeriodStatsFilter value={statsFilters.period} />
        </>
    )
}
