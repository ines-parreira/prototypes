import { TrendCard } from '@repo/reporting'

import { Box, Heading } from '@gorgias/axiom'

import { useAIJourneyDiscountCodeUsageMetrics } from 'AIJourney/hooks'
import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'

type Props = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    journeyIds: string[]
    forceEmpty?: boolean
}

export const DiscountCodesUsageSection = ({
    integrationId,
    userTimezone,
    filters,
    journeyIds,
    forceEmpty,
}: Props) => {
    const discountCodeUsageMetrics = useAIJourneyDiscountCodeUsageMetrics({
        integrationId,
        userTimezone,
        filters,
        journeyIds,
        forceEmpty,
    })

    const discountCodesGeneratedDrillDown = useDrillDownModalTrigger({
        metricName: AIJourneyMetric.DiscountCodesGenerated,
        integrationId,
        journeyIds,
    })

    const discountCodesUsedDrillDown = useDrillDownModalTrigger({
        metricName: AIJourneyMetric.DiscountCodesUsed,
        integrationId,
        journeyIds,
    })

    const drillDownByMetricName: Partial<
        Record<
            AIJourneyMetric,
            { tooltipText: string; openDrillDownModal: () => void }
        >
    > = {
        [AIJourneyMetric.DiscountCodesGenerated]:
            discountCodesGeneratedDrillDown,
        [AIJourneyMetric.DiscountCodesUsed]: discountCodesUsedDrillDown,
    }

    return (
        <Box flexDirection="column" gap="md">
            <Heading size="md">Discount codes usage</Heading>
            <Box gap="md">
                {discountCodeUsageMetrics.map((metric) => (
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
