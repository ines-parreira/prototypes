import {fromJS, Map} from 'immutable'
import React, {useMemo} from 'react'

import {
    LATEST_SATISFACTION_SURVEYS,
    SATISFACTION_SURVEYS,
    stats as statsConfig,
} from 'config/stats'

import useStatResource from 'hooks/reporting/useStatResource'
import useAppSelector from 'hooks/useAppSelector'
import {
    OneDimensionalUnionChart,
    LegacyStatsFilters,
    TwoDimensionalChart,
} from 'models/stat/types'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import KeyMetricStat from 'pages/stats/common/components/charts/KeyMetricStat/KeyMetricStat'
import TableStat from 'pages/stats/common/components/charts/TableStat/TableStat'
import KeyMetricStatWrapper from 'pages/stats/KeyMetricStatWrapper'
import StatsPage from 'pages/stats/StatsPage'
import StatWrapper from 'pages/stats/StatWrapper'
import {SupportPerformanceSatisfactionFilters} from 'pages/stats/support-performance/satisfaction/SupportPerformanceSatisfactionFilters'
import {AccountFeature} from 'state/currentAccount/types'

import {getMessagingAndAppIntegrationsStatsFilter} from 'state/stats/selectors'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

const SUPPORT_PERFORMANCE_SATISFACTION_STAT_NAME =
    'support-performance-satisfaction'

function SupportPerformanceSatisfaction() {
    const integrationsStatsFilter = useAppSelector(
        getMessagingAndAppIntegrationsStatsFilter
    )
    const {cleanStatsFilters: statsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    const pageStatsFilters = useMemo<LegacyStatsFilters>(() => {
        const {channels, score, agents, tags, period} = statsFilters
        return {
            channels,
            score,
            agents,
            tags,
            period,
            integrations: integrationsStatsFilter,
        }
    }, [integrationsStatsFilter, statsFilters])

    const [satisfactionSurveys, isFetchingSatisfactionSurveys] =
        useStatResource<OneDimensionalUnionChart>({
            statName: SUPPORT_PERFORMANCE_SATISFACTION_STAT_NAME,
            resourceName: SATISFACTION_SURVEYS,
            statsFilters: pageStatsFilters,
        })

    const immutableStatsSatisfactionSurveys = useMemo(
        () => fromJS(satisfactionSurveys || {}) as Map<any, any>,
        [satisfactionSurveys]
    )

    const [latestSatisfactionSurveys, isFetchingLatestSatisfactionSurveys] =
        useStatResource<TwoDimensionalChart>({
            statName: SUPPORT_PERFORMANCE_SATISFACTION_STAT_NAME,
            resourceName: LATEST_SATISFACTION_SURVEYS,
            statsFilters: pageStatsFilters,
        })

    return (
        <StatsPage
            title="Satisfaction"
            description="Satisfaction survey statistics allow you to measure how good is the support your team is providing over time.
How many surveys have been sent, response rate, average scores and more."
            helpUrl="https://docs.gorgias.com/statistics/statistics#satisfaction"
            titleExtra={<SupportPerformanceSatisfactionFilters />}
        >
            <KeyMetricStatWrapper>
                <KeyMetricStat
                    data={immutableStatsSatisfactionSurveys.getIn([
                        'data',
                        'data',
                    ])}
                    meta={immutableStatsSatisfactionSurveys.get('meta')}
                    loading={isFetchingSatisfactionSurveys}
                    config={statsConfig.get(SATISFACTION_SURVEYS)}
                />
            </KeyMetricStatWrapper>
            <StatWrapper
                stat={latestSatisfactionSurveys}
                isFetchingStat={isFetchingLatestSatisfactionSurveys}
                resourceName={LATEST_SATISFACTION_SURVEYS}
                statsFilters={pageStatsFilters}
                helpText="Latest surveys for selected period"
                isDownloadable
            >
                {(stat) => (
                    <TableStat
                        context={{tagColors: null}}
                        data={stat.getIn(['data', 'data'])}
                        meta={stat.get('meta')}
                        config={statsConfig.get(LATEST_SATISFACTION_SURVEYS)}
                    />
                )}
            </StatWrapper>
        </StatsPage>
    )
}

export default withFeaturePaywall(AccountFeature.SatisfactionSurveys)(
    SupportPerformanceSatisfaction
)
