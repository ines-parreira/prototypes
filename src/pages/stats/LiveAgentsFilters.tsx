import React from 'react'
import {useCleanStatsFiltersWithLogicalOperators} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import DEPRECATED_AgentsStatsFilter from 'pages/stats/common/filters/DEPRECATED_AgentsStatsFilter'
import ChannelsStatsFilter from 'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter'
import {
    getPageStatsFiltersWithLogicalOperators,
    getStatsFilters,
} from 'state/stats/selectors'

export const LiveAgentsFilters = () => {
    const pageStatsFiltersWithLogicalOperators = useAppSelector(
        getPageStatsFiltersWithLogicalOperators
    )
    useCleanStatsFiltersWithLogicalOperators(
        pageStatsFiltersWithLogicalOperators
    )
    const statsFilters = useAppSelector(getStatsFilters)

    return (
        <>
            <ChannelsStatsFilter value={statsFilters.channels} />
            <DEPRECATED_AgentsStatsFilter value={statsFilters.agents} />
        </>
    )
}
