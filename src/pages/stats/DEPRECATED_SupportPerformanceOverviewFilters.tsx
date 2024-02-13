import React from 'react'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import AgentsStatsFilter from 'pages/stats/AgentsStatsFilter'
import ChannelsStatsFilter from 'pages/stats/ChannelsStatsFilter'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import {
    getStatsFilters,
    getStatsMessagingIntegrations,
} from 'state/stats/selectors'

export const DEPRECATED_SupportPerformanceOverviewFilters = () => {
    const statsFilters = useAppSelector(getStatsFilters)
    useCleanStatsFilters(statsFilters)
    const messagingIntegrations = useAppSelector(getStatsMessagingIntegrations)

    return (
        <>
            <IntegrationsStatsFilter
                value={statsFilters.integrations}
                integrations={messagingIntegrations}
                isMultiple
            />
            <ChannelsStatsFilter value={statsFilters.channels} />
            <AgentsStatsFilter value={statsFilters.agents} />
            <TagsStatsFilter value={statsFilters.tags} />
            <PeriodStatsFilter value={statsFilters.period} />
        </>
    )
}
