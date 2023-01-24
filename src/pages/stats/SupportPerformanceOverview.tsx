import React, {useMemo} from 'react'

import {TicketChannel} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import {StatsFilters} from 'models/stat/types'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import AgentsStatsFilter from 'pages/stats/AgentsStatsFilter'
import ChannelsStatsFilter from 'pages/stats/ChannelsStatsFilter'
import IntegrationsStatsFilter from 'pages/stats/IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'
import StatsPage from 'pages/stats/StatsPage'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import {
    getMessagingIntegrationsStatsFilter,
    getStatsFilters,
    getStatsMessagingIntegrations,
} from 'state/stats/selectors'

export default function SupportPerformanceOverview() {
    const messagingIntegrations = useAppSelector(getStatsMessagingIntegrations)
    const statsFilters = useAppSelector(getStatsFilters)
    const integrationsStatsFilter = useAppSelector(
        getMessagingIntegrationsStatsFilter
    )

    const pageStatsFilters = useMemo<StatsFilters>(() => {
        const {channels, agents, tags, period} = statsFilters
        return {
            channels,
            agents,
            tags,
            period,
            integrations: integrationsStatsFilter,
        }
    }, [integrationsStatsFilter, statsFilters])

    return (
        <StatsPage
            title="Overview"
            filters={
                pageStatsFilters && (
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
                        <TagsStatsFilter
                            value={pageStatsFilters.tags}
                            variant="ghost"
                        />
                        <PeriodStatsFilter
                            value={pageStatsFilters.period}
                            variant="ghost"
                        />

                        <Button
                            className="ml-2"
                            fillStyle="ghost"
                            intent="secondary"
                        >
                            <ButtonIconLabel icon="download">
                                Download Data
                            </ButtonIconLabel>
                        </Button>
                    </>
                )
            }
        >
            SupportPerformanceOverview
        </StatsPage>
    )
}
