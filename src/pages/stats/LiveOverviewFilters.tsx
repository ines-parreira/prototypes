import React from 'react'

import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import DEPRECATED_AgentsStatsFilter from 'pages/stats/common/filters/DEPRECATED_AgentsStatsFilter'
import ChannelsStatsFilter from 'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter'
import { getStatsFilters } from 'state/stats/selectors'

export const LiveOverviewFilters = () => {
    useCleanStatsFilters()
    const statsFilters = useAppSelector(getStatsFilters)

    return (
        <>
            <ChannelsStatsFilter value={statsFilters.channels} />
            <DEPRECATED_AgentsStatsFilter value={statsFilters.agents} />
        </>
    )
}
