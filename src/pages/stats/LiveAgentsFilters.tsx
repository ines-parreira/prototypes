import React from 'react'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import AgentsStatsFilter from 'pages/stats/AgentsStatsFilter'
import ChannelsStatsFilter from 'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter'
import {getStatsFilters} from 'state/stats/selectors'

export const LiveAgentsFilters = () => {
    const statsFilters = useAppSelector(getStatsFilters)
    useCleanStatsFilters(statsFilters)

    return (
        <>
            <ChannelsStatsFilter value={statsFilters.channels} />
            <AgentsStatsFilter value={statsFilters.agents} />
        </>
    )
}
