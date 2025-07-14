import { useMemo } from 'react'

import { fromJS, Map } from 'immutable'

import {
    REVENUE_OVERVIEW,
    REVENUE_PER_AGENT,
    REVENUE_PER_DAY,
    REVENUE_PER_TICKET,
    stats as statsConfig,
} from 'domains/reporting/config/stats'
import useStatResource from 'domains/reporting/hooks/useStatResource'
import {
    OneDimensionalUnionChart,
    TwoDimensionalChart,
} from 'domains/reporting/models/stat/types'
import { BarStat } from 'domains/reporting/pages/common/components/charts/BarStat'
import KeyMetricStat from 'domains/reporting/pages/common/components/charts/KeyMetricStat/KeyMetricStat'
import TableStat from 'domains/reporting/pages/common/components/charts/TableStat/TableStat'
import KeyMetricStatWrapper from 'domains/reporting/pages/common/components/KeyMetricStatWrapper'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import StatWrapper from 'domains/reporting/pages/common/layout/StatWrapper'
import RevenueStatsRestrictedFeature from 'domains/reporting/pages/support-performance/components/RevenueStatsRestrictedFeature'
import { SupportPerformanceRevenueFilters } from 'domains/reporting/pages/support-performance/revenue/SupportPerformanceRevenueFilters'
import { getStatsStoreIntegrations } from 'domains/reporting/state/stats/selectors'
import { getCleanStatsFiltersWithInitialStoreIntegration } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import ConvertLimitBanner from 'pages/convert/campaigns/components/ConvertLimitBanner/ConvertLimitBanner'
import { AccountFeature } from 'state/currentAccount/types'

const SUPPORT_PERFORMANCE_REVENUE_STAT_NAME = 'support-performance-revenue'

function SupportPerformanceRevenue() {
    const { statsFilters: pageStatsFilters } = useAppSelector(
        getCleanStatsFiltersWithInitialStoreIntegration,
    )

    const [revenueOverview, isFetchingRevenueOverview] =
        useStatResource<OneDimensionalUnionChart>({
            statName: SUPPORT_PERFORMANCE_REVENUE_STAT_NAME,
            resourceName: REVENUE_OVERVIEW,
            statsFilters: pageStatsFilters,
        })

    const immutableOverview = useMemo(
        () => fromJS(revenueOverview || {}) as Map<any, any>,
        [revenueOverview],
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
                                context={{ tagColors: null }}
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
                                context={{ tagColors: null }}
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
    RevenueOrRestrictedFeaturePage,
)
