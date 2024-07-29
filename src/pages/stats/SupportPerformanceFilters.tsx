import React from 'react'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import DEPRECATED_AgentsStatsFilter from 'pages/stats/common/filters/DEPRECATED_AgentsStatsFilter'
import DEPRECATED_ChannelsStatsFilter from 'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter'
import DEPRECATED_IntegrationsStatsFilter from 'pages/stats/common/filters/DEPRECATED_IntegrationsStatsFilter'
import DEPRECATED_PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import DEPRECATED_TagsStatsFilter from 'pages/stats/common/filters/DEPRECATED_TagsStatsFilter'
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
            <DEPRECATED_IntegrationsStatsFilter
                value={pageStatsFilters.integrations}
                integrations={messagingIntegrations}
                isMultiple
                variant="ghost"
            />
            <DEPRECATED_ChannelsStatsFilter
                value={pageStatsFilters.channels}
                variant="ghost"
            />
            <DEPRECATED_AgentsStatsFilter
                value={pageStatsFilters.agents}
                variant="ghost"
            />
            <DEPRECATED_TagsStatsFilter
                value={pageStatsFilters.tags}
                variant={'ghost'}
            />
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
