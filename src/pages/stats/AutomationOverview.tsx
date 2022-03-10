import React, {useMemo} from 'react'
import {fromJS, Map} from 'immutable'

import {
    getMessagingIntegrationsStatsFilter,
    getStatsFilters,
    getStatsMessagingIntegrations,
} from 'state/stats/selectors'
import {
    AUTOMATION_FLOW,
    AUTOMATION_OVERVIEW,
    AUTOMATION_PER_CHANNEL,
    stats as statsConfig,
} from 'config/stats'
import {
    SankeyDiagram,
    OneDimensionalChart,
    TwoDimensionalChart,
    StatsFilters,
} from 'models/stat/types'
import {TicketChannel} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'

import ChannelsStatsFilter from './ChannelsStatsFilter'
import IntegrationsStatsFilter from './IntegrationsStatsFilter'
import PeriodStatsFilter from './PeriodStatsFilter'
import StatsPage from './StatsPage'
import useStatResource from './useStatResource'
import KeyMetricStatWrapper from './KeyMetricStatWrapper'
import KeyMetricStat from './common/components/charts/KeyMetricStat/KeyMetricStat'
import StatWrapper from './StatWrapper'
import SankeyStat from './common/components/charts/SankeyStat'
import {BarStat} from './common/components/charts/BarStat'

const AUTOMATION_OVERVIEW_STAT_NAME = 'automation-overview'

export default function AutomationOverview() {
    const messagingIntegrations = useAppSelector(getStatsMessagingIntegrations)
    const integrationsStatsFilter = useAppSelector(
        getMessagingIntegrationsStatsFilter
    )
    const statsFilters = useAppSelector(getStatsFilters)

    const pageStatsFilters = useMemo<StatsFilters>(() => {
        const {channels, period} = statsFilters
        return {
            channels,
            period,
            integrations: integrationsStatsFilter,
        }
    }, [integrationsStatsFilter, statsFilters])

    const [automationOverview, isFetchingAutomationOverview] =
        useStatResource<OneDimensionalChart>({
            statName: AUTOMATION_OVERVIEW_STAT_NAME,
            resourceName: AUTOMATION_OVERVIEW,
            statsFilters: pageStatsFilters,
        })

    const immutableAutomationOverview = useMemo(() => {
        return fromJS(automationOverview || {}) as Map<any, any>
    }, [automationOverview])

    const [automationFlow, isFetchingAutomationFlow] =
        useStatResource<SankeyDiagram>({
            statName: AUTOMATION_OVERVIEW_STAT_NAME,
            resourceName: AUTOMATION_FLOW,
            statsFilters: pageStatsFilters,
        })

    const [automationPerChannel, isFetchingAutomationPerChannel] =
        useStatResource<TwoDimensionalChart>({
            statName: AUTOMATION_OVERVIEW_STAT_NAME,
            resourceName: AUTOMATION_PER_CHANNEL,
            statsFilters: pageStatsFilters,
        })

    return (
        <StatsPage
            title="Automation Overview"
            description="The automation overview records how many customer interactions are automated
            (answered and closed without agent intervention) thanks to Gorgias automation features.
            You can see at a glance how many interactions are automated depending on its source and the automation
            tool used to answer it."
            helpUrl="https://docs.gorgias.com/statistics/automation-statistics"
            filters={
                pageStatsFilters && (
                    <>
                        <IntegrationsStatsFilter
                            value={pageStatsFilters.integrations}
                            integrations={messagingIntegrations}
                            isMultiple
                        />
                        <ChannelsStatsFilter
                            value={pageStatsFilters.channels}
                            channels={Object.values(TicketChannel)}
                        />
                        <PeriodStatsFilter value={pageStatsFilters.period} />
                    </>
                )
            }
        >
            {pageStatsFilters && (
                <>
                    <KeyMetricStatWrapper>
                        <KeyMetricStat
                            data={immutableAutomationOverview.getIn([
                                'data',
                                'data',
                            ])}
                            meta={immutableAutomationOverview.get('meta')}
                            loading={isFetchingAutomationOverview}
                            config={statsConfig.get(AUTOMATION_OVERVIEW)}
                        />
                    </KeyMetricStatWrapper>
                    <StatWrapper
                        stat={automationFlow}
                        isFetchingStat={isFetchingAutomationFlow}
                        resourceName={AUTOMATION_FLOW}
                        statsFilters={pageStatsFilters}
                        helpText="Visualize at a glance where your customer interactions come from, if they are automated and if so, from which channel."
                        isDownloadable
                    >
                        {(stat) => (
                            <SankeyStat
                                data={stat.getIn(['data', 'data'])}
                                legend={stat.getIn(['data', 'legend'], null)}
                                config={statsConfig.get(AUTOMATION_FLOW)}
                            />
                        )}
                    </StatWrapper>
                    <StatWrapper
                        stat={automationPerChannel}
                        isFetchingStat={isFetchingAutomationPerChannel}
                        resourceName={AUTOMATION_PER_CHANNEL}
                        statsFilters={pageStatsFilters}
                        helpText="Number of customer interactions automated by channels"
                        isDownloadable
                    >
                        {(stat) => (
                            <BarStat
                                data={stat.getIn(['data', 'data'])}
                                legend={stat.getIn(['data', 'legend'], null)}
                                config={statsConfig.get(AUTOMATION_PER_CHANNEL)}
                            />
                        )}
                    </StatWrapper>
                </>
            )}
        </StatsPage>
    )
}
