import React from 'react'
import {AUTOMATION_INTENTS_CHANNELS} from 'pages/stats/constants'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import ChannelsStatsFilter from 'pages/stats/ChannelsStatsFilter'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import {getStatsFilters} from 'state/stats/selectors'

export const AutomateIntentsFilters = () => {
    const statsFilters = useAppSelector(getStatsFilters)
    useCleanStatsFilters(statsFilters)

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
