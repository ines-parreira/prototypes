import React, {useMemo} from 'react'
import {fromJS, Map} from 'immutable'
import {
    REVENUE_OVERVIEW,
    REVENUE_PER_AGENT,
    REVENUE_PER_DAY,
    REVENUE_PER_TICKET,
    stats as statsConfig,
} from 'config/stats'

import useStatResource from 'hooks/reporting/useStatResource'
import useAppSelector from 'hooks/useAppSelector'
import {
    OneDimensionalUnionChart,
    StatsFilters,
    TwoDimensionalChart,
} from 'models/stat/types'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import {SupportPerformanceRevenueFilters} from 'pages/stats/SupportPerformanceRevenueFilters'
import {AccountFeature} from 'state/currentAccount/types'

import {
    getStatsStoreIntegrations,
    getStoreIntegrationsStatsFilter,
} from 'state/stats/selectors'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import ConvertLimitBanner from 'pages/convert/campaigns/components/ConvertLimitBanner/ConvertLimitBanner'
import {BarStat} from './common/components/charts/BarStat'
import KeyMetricStat from './common/components/charts/KeyMetricStat/KeyMetricStat'
import TableStat from './common/components/charts/TableStat/TableStat'
import KeyMetricStatWrapper from './KeyMetricStatWrapper'
import RevenueStatsRestrictedFeature from './RevenueStatsRestrictedFeature'
import StatsPage from './StatsPage'
import StatWrapper from './StatWrapper'

const SUPPORT_PERFORMANCE_REVENUE_STAT_NAME = 'support-performance-revenue'

function SupportPerformanceRevenue() {
    const storeIntegrations = useAppSelector(getStatsStoreIntegrations)
    const storeStatsFilter = useAppSelector(getStoreIntegrationsStatsFilter)
    const {cleanStatsFilters: statsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    const pageStatsFilters = useMemo<StatsFilters>(() => {
        const {channels, tags, period, campaigns} = statsFilters
        return {
            channels,
            campaigns,
            tags,
            period,
            integrations: storeStatsFilter.length
                ? storeStatsFilter
                : [storeIntegrations[0]!.id],
        }
    }, [storeStatsFilter, statsFilters, storeIntegrations])

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
            titleExtra={<SupportPerformanceRevenueFilters />}
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
                    <ConvertLimitBanner classes={'ml-4 mr-4'} />
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
    const storeIntegrations = useAppSelector(getStatsStoreIntegrations)
    return storeIntegrations.length ? (
        <SupportPerformanceRevenue />
    ) : (
        <RevenueStatsRestrictedFeature />
    )
}

export default withFeaturePaywall(AccountFeature.RevenueStatistics)(
    RevenueOrRestrictedFeaturePage
)
