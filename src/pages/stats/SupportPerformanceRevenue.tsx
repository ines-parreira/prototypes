import React, {useMemo} from 'react'
import {useSelector} from 'react-redux'
import {fromJS, Map} from 'immutable'

import {
    getStatsFiltersJS,
    getStatsStoreIntegrations,
    getStoreIntegrationsStatsFilter,
} from '../../state/stats/selectors'
import {StatsFilterType} from '../../state/stats/types'
import {TicketChannel} from '../../business/types/ticket'
import {
    OneDimensionalUnionChart,
    TwoDimensionalChart,
} from '../../models/stat/types'
import {
    REVENUE_OVERVIEW,
    REVENUE_PER_AGENT,
    REVENUE_PER_DAY,
    REVENUE_PER_TICKET,
    stats as statsConfig,
} from '../../config/stats'
import withFeaturePaywall from '../common/utils/withFeaturePaywall'
import {AccountFeature} from '../../state/currentAccount/types'

import IntegrationsStatsFilter from './IntegrationsStatsFilter'
import ChannelsStatsFilter from './ChannelsStatsFilter'
import PeriodStatsFilter from './PeriodStatsFilter'
import StatsPage from './StatsPage'
import TagsStatsFilter from './TagsStatsFilter'
import useStatResource from './useStatResource'
import KeyMetricStat from './common/components/charts/KeyMetricStat/KeyMetricStat'
import StatWrapper from './StatWrapper'
import {BarStat} from './common/components/charts/BarStat'
import TableStat from './common/components/charts/TableStat/TableStat'
import RevenueStatsRestrictedFeature from './RevenueStatsRestrictedFeature'
import KeyMetricStatWrapper from './KeyMetricStatWrapper'

const SUPPORT_PERFORMANCE_REVENUE_STAT_NAME = 'support-performance-revenue'

function SupportPerformanceRevenue() {
    const storeIntegrations = useSelector(getStatsStoreIntegrations)
    const storeStatsFilter = useSelector(getStoreIntegrationsStatsFilter)
    const statsFilters = useSelector(getStatsFiltersJS)

    const pageStatsFilters = useMemo(() => {
        return (
            statsFilters && {
                [StatsFilterType.Integrations]: storeStatsFilter.length
                    ? storeStatsFilter
                    : [storeIntegrations[0]!.id],
                [StatsFilterType.Channels]:
                    statsFilters[StatsFilterType.Channels] || [],
                [StatsFilterType.Tags]:
                    statsFilters[StatsFilterType.Tags] || [],
                [StatsFilterType.Period]:
                    statsFilters[StatsFilterType.Period] || [],
            }
        )
    }, [storeStatsFilter, statsFilters])

    const [revenueOverview, isFetchingRevenueOverview] =
        useStatResource<OneDimensionalUnionChart>({
            statName: SUPPORT_PERFORMANCE_REVENUE_STAT_NAME,
            resourceName: REVENUE_OVERVIEW,
            statsFilters: pageStatsFilters,
        })

    const immutableOverview = useMemo(
        () => fromJS(revenueOverview || {}) as Map<any, any>,
        [revenueOverview]
    )

    const [revenuePerDay, isFetchingRevenuePerDay] =
        useStatResource<TwoDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_REVENUE_STAT_NAME,
            resourceName: REVENUE_PER_DAY,
            statsFilters: pageStatsFilters,
        })

    const [revenuePerAgent, isFetchingRevenuePerAgent] =
        useStatResource<TwoDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_REVENUE_STAT_NAME,
            resourceName: REVENUE_PER_AGENT,
            statsFilters: pageStatsFilters,
        })

    const [revenuePerTicket, isFetchingRevenuePerTicket] =
        useStatResource<TwoDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_REVENUE_STAT_NAME,
            resourceName: REVENUE_PER_TICKET,
            statsFilters: pageStatsFilters,
        })

    return (
        <StatsPage
            title="Revenue"
            description="Revenue statistics allow you to measure how much money your support team is generating by
helping customers through the purchasing journey."
            helpUrl="https://docs.gorgias.com/statistics/revenue-statistics"
            filters={
                pageStatsFilters && (
                    <>
                        <IntegrationsStatsFilter
                            value={
                                pageStatsFilters[StatsFilterType.Integrations]
                            }
                            integrations={storeIntegrations}
                            isRequired
                        />
                        <ChannelsStatsFilter
                            value={pageStatsFilters[StatsFilterType.Channels]}
                            channels={Object.values(TicketChannel)}
                        />
                        <TagsStatsFilter
                            value={pageStatsFilters[StatsFilterType.Tags]}
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
                    <KeyMetricStatWrapper>
                        <KeyMetricStat
                            data={immutableOverview.getIn(['data', 'data'])}
                            meta={immutableOverview.get('meta')}
                            loading={isFetchingRevenueOverview}
                            config={statsConfig.get(REVENUE_OVERVIEW)}
                        />
                    </KeyMetricStatWrapper>
                    <StatWrapper
                        stat={revenuePerDay}
                        isFetchingStat={isFetchingRevenuePerDay}
                        resourceName={REVENUE_PER_DAY}
                        statsFilters={pageStatsFilters}
                        helpText="Number of converted and created tickets per day"
                        isDownloadable
                    >
                        {(stat) => (
                            <BarStat
                                data={stat.getIn(['data', 'data'])}
                                legend={stat.getIn(['data', 'legend'], null)}
                                config={statsConfig.get(REVENUE_PER_DAY)}
                            />
                        )}
                    </StatWrapper>
                    <StatWrapper
                        stat={revenuePerAgent}
                        isFetchingStat={isFetchingRevenuePerAgent}
                        resourceName={REVENUE_PER_AGENT}
                        statsFilters={pageStatsFilters}
                        helpText="Breakdown of sales metrics per agent"
                        isDownloadable
                    >
                        {(stat) => (
                            <TableStat
                                context={{tagColors: null}}
                                data={stat.getIn(['data', 'data'])}
                                meta={stat.get('meta')}
                                config={statsConfig.get(REVENUE_PER_AGENT)}
                            />
                        )}
                    </StatWrapper>
                    <StatWrapper
                        stat={revenuePerTicket}
                        isFetchingStat={isFetchingRevenuePerTicket}
                        resourceName={REVENUE_PER_TICKET}
                        statsFilters={pageStatsFilters}
                        helpText="Tickets Converted"
                        isDownloadable
                    >
                        {(stat) => (
                            <TableStat
                                context={{tagColors: null}}
                                data={stat.getIn(['data', 'data'])}
                                meta={stat.get('meta')}
                                config={statsConfig.get(REVENUE_PER_TICKET)}
                            />
                        )}
                    </StatWrapper>
                </>
            )}
        </StatsPage>
    )
}

function RevenueOrRestrictedFeaturePage() {
    const storeIntegrations = useSelector(getStatsStoreIntegrations)
    return storeIntegrations.length ? (
        <SupportPerformanceRevenue />
    ) : (
        <RevenueStatsRestrictedFeature />
    )
}

export default withFeaturePaywall(AccountFeature.RevenueStatistics)(
    RevenueOrRestrictedFeaturePage
)
