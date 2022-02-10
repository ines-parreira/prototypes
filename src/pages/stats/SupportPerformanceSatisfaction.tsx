import React, {useMemo} from 'react'
import {fromJS, Map} from 'immutable'
import {useSelector} from 'react-redux'

import {
    getMessagingIntegrationsStatsFilter,
    getStatsFilters,
    getStatsMessagingIntegrations,
} from 'state/stats/selectors'
import {
    LATEST_SATISFACTION_SURVEYS,
    SATISFACTION_SURVEY_MAX_SCORE,
    SATISFACTION_SURVEY_MIN_SCORE,
    SATISFACTION_SURVEYS,
    stats as statsConfig,
} from 'config/stats'
import {
    OneDimensionalUnionChart,
    StatsFilters,
    TwoDimensionalChart,
} from 'models/stat/types'
import {TicketChannel} from 'business/types/ticket'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import {AccountFeature} from 'state/currentAccount/types'

import IntegrationsStatsFilter from './IntegrationsStatsFilter'
import ChannelsStatsFilter from './ChannelsStatsFilter'
import PeriodStatsFilter from './PeriodStatsFilter'
import useStatResource from './useStatResource'
import StatsPage from './StatsPage'
import {ScoreStatsFilter} from './ScoreStatsFilter'
import AgentsStatsFilter from './AgentsStatsFilter'
import TagsStatsFilter from './TagsStatsFilter'
import KeyMetricStat from './common/components/charts/KeyMetricStat/KeyMetricStat'
import StatWrapper from './StatWrapper'
import TableStat from './common/components/charts/TableStat/TableStat'
import KeyMetricStatWrapper from './KeyMetricStatWrapper'

const SUPPORT_PERFORMANCE_SATISFACTION_STAT_NAME =
    'support-performance-satisfaction'

function SupportPerformanceSatisfaction() {
    const messagingIntegrations = useSelector(getStatsMessagingIntegrations)
    const integrationsStatsFilter = useSelector(
        getMessagingIntegrationsStatsFilter
    )
    const statsFilters = useSelector(getStatsFilters)

    const pageStatsFilters = useMemo<StatsFilters>(() => {
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
            filters={
                <>
                    <IntegrationsStatsFilter
                        value={integrationsStatsFilter}
                        integrations={messagingIntegrations}
                        isMultiple
                    />
                    <ChannelsStatsFilter
                        value={pageStatsFilters.channels}
                        channels={[TicketChannel.Chat, TicketChannel.Email]}
                    />
                    <ScoreStatsFilter
                        value={pageStatsFilters.score}
                        minValue={SATISFACTION_SURVEY_MIN_SCORE}
                        maxValue={SATISFACTION_SURVEY_MAX_SCORE}
                        isDescending
                    />
                    <AgentsStatsFilter value={pageStatsFilters.agents} />
                    <TagsStatsFilter value={pageStatsFilters.tags} />
                    <PeriodStatsFilter value={pageStatsFilters.period} />
                </>
            }
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
