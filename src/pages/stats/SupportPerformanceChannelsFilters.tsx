import React from 'react'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import ChannelsStatsFilter from 'pages/stats/ChannelsStatsFilter'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import {
    getMessagingIntegrationsStatsFilter,
    getStatsFilters,
    getStatsMessagingIntegrations,
} from 'state/stats/selectors'

export const SupportPerformanceChannelsFilters = () => {
    const statsFilters = useAppSelector(getStatsFilters)
    useCleanStatsFilters(statsFilters)
    const messagingIntegrations = useAppSelector(getStatsMessagingIntegrations)
    const integrationsStatsFilter = useAppSelector(
        getMessagingIntegrationsStatsFilter
    )
    return (
        <>
            <IntegrationsStatsFilter
                value={integrationsStatsFilter}
                integrations={messagingIntegrations}
                isMultiple
            />
            <ChannelsStatsFilter value={statsFilters.channels} />
            <PeriodStatsFilter value={statsFilters.period} />
        </>
    )
}
