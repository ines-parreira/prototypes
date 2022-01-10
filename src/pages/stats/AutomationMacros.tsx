import React, {useMemo} from 'react'
import {useSelector} from 'react-redux'

import {TicketChannel} from 'business/types/ticket'
import {MESSAGES_SENT_PER_MACRO, stats as statsConfig} from 'config/stats'
import {TwoDimensionalChart} from 'models/stat/types'
import {
    getMessagingIntegrationsStatsFilter,
    getStatsFiltersJS,
    getStatsMessagingIntegrations,
} from 'state/stats/selectors'
import {StatsFilterType} from 'state/stats/types'

import ChannelsStatsFilter from './ChannelsStatsFilter'
import TableStat from './common/components/charts/TableStat/TableStat'
import IntegrationsStatsFilter from './IntegrationsStatsFilter'
import PeriodStatsFilter from './PeriodStatsFilter'
import StatsPage from './StatsPage'
import StatWrapper from './StatWrapper'
import useStatResource from './useStatResource'

export const AUTOMATION_MACROS_STAT_NAME = 'automation-macros'

export default function AutomationMacros() {
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
                [StatsFilterType.Period]:
                    statsFilters[StatsFilterType.Period] || [],
            }
        )
    }, [integrationsStatsFilter, statsFilters])

    const [messagesSentPerMacro, isFetchingMessagesSentPerMacro] =
        useStatResource<TwoDimensionalChart>({
            statName: AUTOMATION_MACROS_STAT_NAME,
            resourceName: MESSAGES_SENT_PER_MACRO,
            statsFilters: pageStatsFilters,
        })

    return (
        <StatsPage
            title="Macros"
            description="Macro statistics is an excellent way to ensure your agents are very efficient by using macros.
            It also shows what macros are being used the most often so you can you can provide this information elsewhere in order
            to help reduce your support inquiries."
            helpUrl="https://docs.gorgias.com/statistics/statistics#macros"
            filters={
                pageStatsFilters && (
                    <>
                        <IntegrationsStatsFilter
                            value={integrationsStatsFilter}
                            integrations={messagingIntegrations}
                            isMultiple
                        />
                        <ChannelsStatsFilter
                            value={pageStatsFilters[StatsFilterType.Channels]}
                            channels={Object.values(TicketChannel)}
                        />
                        <PeriodStatsFilter
                            value={pageStatsFilters[StatsFilterType.Period]}
                        />
                    </>
                )
            }
        >
            {pageStatsFilters && (
                <StatWrapper
                    stat={messagesSentPerMacro}
                    isFetchingStat={isFetchingMessagesSentPerMacro}
                    resourceName={MESSAGES_SENT_PER_MACRO}
                    statsFilters={pageStatsFilters}
                    helpText="Number of messages sent by an agent or a rule per macro"
                    isDownloadable
                >
                    {(stat) => (
                        <TableStat
                            context={{tagColors: null}}
                            data={stat.getIn(['data', 'data'])}
                            meta={stat.get('meta')}
                            config={statsConfig.get(MESSAGES_SENT_PER_MACRO)}
                        />
                    )}
                </StatWrapper>
            )}
        </StatsPage>
    )
}
