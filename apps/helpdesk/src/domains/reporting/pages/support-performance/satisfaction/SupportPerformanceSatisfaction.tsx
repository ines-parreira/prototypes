import { useMemo } from 'react'

import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import {
    LATEST_SATISFACTION_SURVEYS,
    SATISFACTION_SURVEYS,
    stats as statsConfig,
} from 'domains/reporting/config/stats'
import useStatResource from 'domains/reporting/hooks/useStatResource'
import type {
    LegacyStatsFilters,
    OneDimensionalUnionChart,
    TwoDimensionalChart,
} from 'domains/reporting/models/stat/types'
import KeyMetricStat from 'domains/reporting/pages/common/components/charts/KeyMetricStat/KeyMetricStat'
import TableStat from 'domains/reporting/pages/common/components/charts/TableStat/TableStat'
import KeyMetricStatWrapper from 'domains/reporting/pages/common/components/KeyMetricStatWrapper'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import StatWrapper from 'domains/reporting/pages/common/layout/StatWrapper'
import { SupportPerformanceSatisfactionFilters } from 'domains/reporting/pages/support-performance/satisfaction/SupportPerformanceSatisfactionFilters'
import { getMessagingAndAppIntegrationsStatsFilter } from 'domains/reporting/state/stats/selectors'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import { AccountFeature } from 'state/currentAccount/types'

const SUPPORT_PERFORMANCE_SATISFACTION_STAT_NAME =
    'support-performance-satisfaction'

function SupportPerformanceSatisfaction() {
    const integrationsStatsFilter = useAppSelector(
        getMessagingAndAppIntegrationsStatsFilter,
    )
    const { cleanStatsFilters: statsFilters } = useAppSelector(
        getCleanStatsFiltersWithTimezone,
    )

    const pageStatsFilters = useMemo<LegacyStatsFilters>(() => {
        const { channels, score, agents, tags, period } = statsFilters
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
        [satisfactionSurveys],
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
                        context={{ tagColors: null }}
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
    SupportPerformanceSatisfaction,
)
