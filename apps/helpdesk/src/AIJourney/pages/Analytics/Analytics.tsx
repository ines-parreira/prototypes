import { useMemo } from 'react'

import { TrendCard } from '@repo/reporting'
import { motion } from 'framer-motion'

import { Card, Heading, LoadingSpinner } from '@gorgias/axiom'

import { useFilters } from 'AIJourney/hooks'
import { useAIJourneyConversionRate } from 'AIJourney/hooks/useAIJourneyConversionRate/useAIJourneyConversionRate'
import { useAIJourneyGmvInfluenced } from 'AIJourney/hooks/useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced'
import { useJourneyContext } from 'AIJourney/providers'
import { seriesToTwoDimensionalDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

import css from './Analytics.less'

export const Analytics = () => {
    const { isLoading, currentIntegration } = useJourneyContext()
    const integrationId = useMemo(() => {
        return currentIntegration?.id || 0
    }, [currentIntegration])
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)

    const filters = useFilters()
    const granularity = ReportingGranularity.Week

    const gmvInfluenced = useAIJourneyGmvInfluenced(
        integrationId.toString(),
        userTimezone,
        filters,
        granularity,
    )
    const conversionRate = useAIJourneyConversionRate(
        integrationId.toString(),
        userTimezone,
        filters,
        granularity,
    )

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <motion.div
            className={css.container}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Heading size="md">Analytics</Heading>
            <Card flexDirection="row" width="100%" gap="xxxl" padding="xl">
                <TrendCard
                    trendColor="neutral"
                    withBorder={false}
                    withFixedWidth={false}
                    hint={{
                        title: 'Total value of orders linked to customers who received messages during the campaign. Reflects the overall sales impact attributed to this flow.',
                    }}
                    currency={gmvInfluenced.currency}
                    isLoading={gmvInfluenced.isLoading}
                    metricFormat="currency"
                    interpretAs={gmvInfluenced.interpretAs}
                    timeSeriesData={seriesToTwoDimensionalDataItem(
                        gmvInfluenced.series,
                    )}
                    trend={{
                        isError: false,
                        isFetching: gmvInfluenced.isLoading,
                        data: {
                            label: 'GMV Influenced',
                            value: gmvInfluenced.value,
                            prevValue: gmvInfluenced.prevValue ?? null,
                        },
                    }}
                />

                <TrendCard
                    trendColor="neutral"
                    withBorder={false}
                    withFixedWidth={false}
                    hint={{
                        title: 'Percentage of recipients who completed a purchase after receiving a message. Connects message performance directly to revenue outcomes.',
                    }}
                    currency={conversionRate.currency}
                    isLoading={conversionRate.isLoading}
                    metricFormat="percent"
                    interpretAs={conversionRate.interpretAs}
                    timeSeriesData={seriesToTwoDimensionalDataItem(
                        conversionRate.series,
                    )}
                    trend={{
                        isError: false,
                        isFetching: conversionRate.isLoading,
                        data: {
                            label: 'Conversion Rate',
                            value: conversionRate.value,
                            prevValue: conversionRate.prevValue ?? null,
                        },
                    }}
                />
            </Card>
        </motion.div>
    )
}
