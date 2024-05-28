import React from 'react'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import ChannelsStatsFilter from 'pages/stats/ChannelsStatsFilter'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import {
    getStatsFilters,
    getMessagingAndAppIntegrationsStatsFilter,
    getStatsMessagingAndAppIntegrations,
} from 'state/stats/selectors'

export const SupportPerformanceTagsFilters = () => {
    const statsFilters = useAppSelector(getStatsFilters)
    useCleanStatsFilters(statsFilters)
    const messagingIntegrations = useAppSelector(
        getStatsMessagingAndAppIntegrations
    )
    const integrationsStatsFilter = useAppSelector(
        getMessagingAndAppIntegrationsStatsFilter
    )

    return (
        <>
            <IntegrationsStatsFilter
                value={integrationsStatsFilter}
                integrations={messagingIntegrations}
                isMultiple
            />
            <ChannelsStatsFilter value={statsFilters.channels} />
            <TagsStatsFilter value={statsFilters.tags} />
            <PeriodStatsFilter value={statsFilters.period} />
        </>
    )
}
