import React, { useMemo } from 'react'

import { MESSAGES_SENT_PER_MACRO, stats as statsConfig } from 'config/stats'
import useStatResource from 'hooks/reporting/useStatResource'
import useAppSelector from 'hooks/useAppSelector'
import { LegacyStatsFilters, TwoDimensionalChart } from 'models/stat/types'
import TableStat from 'pages/stats/common/components/charts/TableStat/TableStat'
import ChannelsStatsFilter from 'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter'
import DEPRECATED_IntegrationsStatsFilter from 'pages/stats/common/filters/DEPRECATED_IntegrationsStatsFilter'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import StatsPage from 'pages/stats/common/layout/StatsPage'
import StatWrapper from 'pages/stats/common/layout/StatWrapper'
import {
    getMessagingAndAppIntegrationsStatsFilter,
    getStatsFilters,
    getStatsMessagingAndAppIntegrations,
} from 'state/stats/selectors'

export const AUTOMATION_MACROS_STAT_NAME = 'automation-macros'

export default function AutomateMacros() {
    const messagingIntegrations = useAppSelector(
        getStatsMessagingAndAppIntegrations,
    )
    const integrationsStatsFilter = useAppSelector(
        getMessagingAndAppIntegrationsStatsFilter,
    )
    const statsFilters = useAppSelector(getStatsFilters)

    const pageStatsFilters = useMemo<LegacyStatsFilters>(() => {
        const { channels, period } = statsFilters
        return {
            channels,
            period,
            integrations: integrationsStatsFilter,
        }
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
            titleExtra={
                pageStatsFilters && (
                    <>
                        <DEPRECATED_IntegrationsStatsFilter
                            value={integrationsStatsFilter}
                            integrations={messagingIntegrations}
                            isMultiple
                        />
                        <ChannelsStatsFilter
                            value={pageStatsFilters.channels}
                        />
                        <PeriodStatsFilter value={pageStatsFilters.period} />
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
                            context={{ tagColors: null }}
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
