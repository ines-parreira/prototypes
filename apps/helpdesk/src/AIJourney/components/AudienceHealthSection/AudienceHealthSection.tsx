import { TrendCard } from '@repo/reporting'

import { Box, Heading } from '@gorgias/axiom'

import { useAIJourneyAudienceHealthMetrics } from 'AIJourney/hooks/useAIJourneyAudienceHealthMetrics/useAIJourneyAudienceHealthMetrics'
import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'

import css from './AudienceHealthSection.less'

type Props = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    shopName: string
    journeyIds: string[]
    forceEmpty?: boolean
}

export const AudienceHealthSection = ({
    integrationId,
    userTimezone,
    filters,
    shopName,
    journeyIds,
    forceEmpty,
}: Props) => {
    const audienceHealthMetrics = useAIJourneyAudienceHealthMetrics({
        integrationId,
        userTimezone,
        filters,
        shopName,
        journeyIds,
        forceEmpty,
    })

    const totalConversationsDrillDown = useDrillDownModalTrigger({
        metricName: AIJourneyMetric.TotalConversations,
        title: 'Recipients',
        integrationId,
        journeyIds,
    })

    const totalOptOutsDrillDown = useDrillDownModalTrigger({
        metricName: AIJourneyMetric.TotalOptOuts,
        title: 'Total opted-out',
        integrationId,
        journeyIds,
    })

    const totalRepliesDrillDown = useDrillDownModalTrigger({
        metricName: AIJourneyMetric.TotalReplies,
        title: 'Recipients who replied',
        integrationId,
        journeyIds,
    })

    const optOutAfterReplyDrillDown = useDrillDownModalTrigger({
        metricName: AIJourneyMetric.OptOutAfterReply,
        title: 'Opted-out after reply',
        integrationId,
        journeyIds,
    })

    const drillDownByMetricName: Partial<
        Record<
            AIJourneyMetric,
            { tooltipText: string; openDrillDownModal: () => void }
        >
    > = {
        [AIJourneyMetric.TotalConversations]: totalConversationsDrillDown,
        [AIJourneyMetric.TotalOptOuts]: totalOptOutsDrillDown,
        [AIJourneyMetric.TotalReplies]: totalRepliesDrillDown,
        [AIJourneyMetric.OptOutAfterReply]: optOutAfterReplyDrillDown,
    }

    return (
        <Box flexDirection="column" gap="md">
            <Heading size="md">Audience health</Heading>
            <Box gap="md" flexWrap="wrap" className={css.trendCardGrid}>
                {audienceHealthMetrics.map((metric) => (
                    <TrendCard
                        key={`key-metric-${metric.trend.data?.label}`}
                        withFixedWidth={false}
                        isLoading={metric.trend.isFetching}
                        hint={metric.hint}
                        metricFormat={metric.metricFormat}
                        interpretAs={metric.interpretAs}
                        trend={metric.trend}
                        drillDown={
                            metric.drilldownMetricName
                                ? drillDownByMetricName[
                                      metric.drilldownMetricName
                                  ]
                                : undefined
                        }
                    />
                ))}
            </Box>
        </Box>
    )
}
