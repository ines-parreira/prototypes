import React from 'react'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import {TicketChannel} from 'business/types/ticket'
import AgentsStatsFilter from 'pages/stats/AgentsStatsFilter'
import ChannelsStatsFilter from 'pages/stats/ChannelsStatsFilter'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import {
    getPageStatsFilters,
    getStatsMessagingIntegrations,
} from 'state/stats/selectors'

export const SupportPerformanceFilters = () => {
    const messagingIntegrations = useAppSelector(getStatsMessagingIntegrations)
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
                channels={Object.values(TicketChannel)}
                variant="ghost"
            />
            <AgentsStatsFilter
                value={pageStatsFilters.agents}
                variant="ghost"
            />
            <TagsStatsFilter value={pageStatsFilters.tags} variant={'ghost'} />
            <PeriodStatsFilter
                initialSettings={{
                    maxSpan: 365,
                }}
                value={pageStatsFilters.period}
                variant="ghost"
            />
        </>
    )
}
