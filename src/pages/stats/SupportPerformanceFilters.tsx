import React from 'react'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import AgentsStatsFilter from 'pages/stats/AgentsStatsFilter'
import ChannelsStatsFilter from 'pages/stats/ChannelsStatsFilter'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import DEPRECATED_PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import {
    getPageStatsFilters,
    getStatsMessagingAndAppIntegrations,
} from 'state/stats/selectors'

export const SupportPerformanceFilters = () => {
    const messagingIntegrations = useAppSelector(
        getStatsMessagingAndAppIntegrations
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    useCleanStatsFilters(pageStatsFilters)

    return (
        <>
            <IntegrationsStatsFilter
                value={pageStatsFilters.integrations}
                integrations={messagingIntegrations}
                isMultiple
                variant="ghost"
            />
            <ChannelsStatsFilter
                value={pageStatsFilters.channels}
                variant="ghost"
            />
            <AgentsStatsFilter
                value={pageStatsFilters.agents}
                variant="ghost"
            />
            <TagsStatsFilter value={pageStatsFilters.tags} variant={'ghost'} />
            <DEPRECATED_PeriodStatsFilter
                initialSettings={{
                    maxSpan: 365,
                }}
                value={pageStatsFilters.period}
                variant="ghost"
            />
        </>
    )
}
