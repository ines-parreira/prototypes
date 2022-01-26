import React, {useMemo} from 'react'

import {useSelector} from 'react-redux'

import {
    getMessagingIntegrationsStatsFilter,
    getStatsFiltersJS,
    getStatsMessagingIntegrations,
} from '../../state/stats/selectors'
import {StatsFilterType} from '../../state/stats/types'
import {
    stats as statsConfig,
    TICKETS_CLOSED_PER_AGENT,
    TICKETS_CLOSED_PER_AGENT_PER_DAY,
} from '../../config/stats'
import {TwoDimensionalChart} from '../../models/stat/types'
import {TicketChannel} from '../../business/types/ticket'

import IntegrationsStatsFilter from './IntegrationsStatsFilter'
import ChannelsStatsFilter from './ChannelsStatsFilter'
import PeriodStatsFilter from './PeriodStatsFilter'
import StatWrapper from './StatWrapper'
import useStatResource from './useStatResource'
import BarStat from './common/components/charts/BarStat'
import TableStat from './common/components/charts/TableStat/TableStat'
import StatsPage from './StatsPage'
import AgentsStatsFilter from './AgentsStatsFilter'
import StatsFiltersContext from './StatsFiltersContext'

const SUPPORT_PERFORMANCE_AGENTS_STAT_NAME = 'support-performance-agents'

export default function SupportPerformanceAgents() {
    const messagingIntegrations = useSelector(getStatsMessagingIntegrations)
    const integrationsStatsFilter = useSelector(
        getMessagingIntegrationsStatsFilter
    )
    const statsFilters = useSelector(getStatsFiltersJS)

    const pageStatsFilters = useMemo(() => {
        return (
            statsFilters && {
                [StatsFilterType.Integrations]: integrationsStatsFilter,
                [StatsFilterType.Channels]:
                    statsFilters[StatsFilterType.Channels] || [],
                [StatsFilterType.Agents]:
                    statsFilters[StatsFilterType.Agents] || [],
                [StatsFilterType.Period]:
                    statsFilters[StatsFilterType.Period] || [],
            }
        )
    }, [integrationsStatsFilter, statsFilters])

    const [ticketsClosedPerAgentPerDay, isFetchingTicketsClosedPerAgentPerDay] =
        useStatResource<TwoDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_AGENTS_STAT_NAME,
            resourceName: TICKETS_CLOSED_PER_AGENT_PER_DAY,
            statsFilters: pageStatsFilters,
        })

    const [ticketsClosedPerAgent, isFetchingTicketsClosedPerAgent] =
        useStatResource<TwoDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_AGENTS_STAT_NAME,
            resourceName: TICKETS_CLOSED_PER_AGENT,
            statsFilters: pageStatsFilters,
        })

    return (
        <StatsFiltersContext.Provider value={pageStatsFilters}>
            <StatsPage
                title="Agents"
                description="Agents statistics will show you how many tickets were closed by each agent during this period."
                helpUrl="https://docs.gorgias.com/statistics/statistics#agents"
                filters={
                    pageStatsFilters && (
                        <>
                            <IntegrationsStatsFilter
                                value={integrationsStatsFilter}
                                integrations={messagingIntegrations}
                                isMultiple
                            />
                            <ChannelsStatsFilter
                                value={
                                    pageStatsFilters[StatsFilterType.Channels]
                                }
                                channels={Object.values(TicketChannel)}
                            />
                            <AgentsStatsFilter
                                value={pageStatsFilters[StatsFilterType.Agents]}
                            />
                            <PeriodStatsFilter
                                value={pageStatsFilters[StatsFilterType.Period]}
                            />
                        </>
                    )
                }
            >
                {pageStatsFilters && (
                    <>
                        <StatWrapper
                            stat={ticketsClosedPerAgentPerDay}
                            isFetchingStat={
                                isFetchingTicketsClosedPerAgentPerDay
                            }
                            resourceName={TICKETS_CLOSED_PER_AGENT_PER_DAY}
                            statsFilters={pageStatsFilters}
                            helpText="Number of tickets closed per assigned agent, per day"
                            isDownloadable
                        >
                            {(stat) => (
                                <BarStat
                                    data={stat.getIn(['data', 'data'])}
                                    legend={stat.getIn(
                                        ['data', 'legend'],
                                        null
                                    )}
                                    config={statsConfig.get(
                                        TICKETS_CLOSED_PER_AGENT_PER_DAY
                                    )}
                                />
                            )}
                        </StatWrapper>
                        <StatWrapper
                            stat={ticketsClosedPerAgent}
                            isFetchingStat={isFetchingTicketsClosedPerAgent}
                            resourceName={TICKETS_CLOSED_PER_AGENT}
                            statsFilters={pageStatsFilters}
                            helpText="Number of tickets closed per assigned agent"
                            isDownloadable
                        >
                            {(stat) => (
                                <TableStat
                                    context={{tagColors: null}}
                                    data={stat.getIn(['data', 'data'])}
                                    meta={stat.get('meta')}
                                    config={statsConfig.get(
                                        TICKETS_CLOSED_PER_AGENT
                                    )}
                                />
                            )}
                        </StatWrapper>
                    </>
                )}
            </StatsPage>
        </StatsFiltersContext.Provider>
    )
}
