import { useMemo } from 'react'

import { TrendCard } from '@repo/reporting'
import { motion } from 'framer-motion'

import {
    Box,
    Card,
    Heading,
    LegacyLoadingSpinner as LoadingSpinner,
} from '@gorgias/axiom'

import {
    useAIJourneyTotalConversations,
    useAverageOrderValue,
    useFilters,
    useRevenuePerRecipient,
} from 'AIJourney/hooks'
import { useAIJourneyConversionRate } from 'AIJourney/hooks/useAIJourneyConversionRate/useAIJourneyConversionRate'
import { useAIJourneyGmvInfluenced } from 'AIJourney/hooks/useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced'
import { useJourneyContext } from 'AIJourney/providers'
import { seriesToTwoDimensionalDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

import { useGetNamespacedShopNameForStore } from '../../../domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore'
import { useAIJourneyOptOutRate } from '../../hooks/useAIJourneyOptOutRate/useAIJourneyOptOutRate'
import { useAIJourneyResponseRate } from '../../hooks/useAIJourneyResponseRate/useAIJourneyResponseRate'
import { useClickThroughRate } from '../../hooks/useClickThroughRate/useClickThroughRate'

import css from './Analytics.less'

export const Analytics = () => {
    const { isLoading, currentIntegration } = useJourneyContext()
    const integrationId = useMemo(() => {
        return (currentIntegration?.id || 0).toString()
    }, [currentIntegration])
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)

    const filters = useFilters()
    const granularity = ReportingGranularity.Week

    const gmvInfluenced = useAIJourneyGmvInfluenced(
        integrationId,
        userTimezone,
        filters,
        granularity,
    )
    const conversionRate = useAIJourneyConversionRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
    )

    const shopName = useGetNamespacedShopNameForStore(
        currentIntegration?.id ? [currentIntegration.id] : [],
    )
    const optOutRate = useAIJourneyOptOutRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        shopName,
    )
    const clickThroughRate = useClickThroughRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        shopName,
    )

    const responseRate = useAIJourneyResponseRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        shopName,
    )

    const totalRecipients = useAIJourneyTotalConversations(
        integrationId,
        userTimezone,
        filters,
        granularity,
    )

    const averageOrderValue = useAverageOrderValue(
        integrationId,
        userTimezone,
        filters,
        granularity,
    )
    const revenuePerRecipient = useRevenuePerRecipient(
        integrationId,
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
                    withBorder={false}
                    withFixedWidth={false}
                    hint={{
                        title: 'Percentage of recipients who completed a purchase after receiving a message. Connects message performance directly to revenue outcomes.',
                    }}
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
            <Heading size="md">Key metrics</Heading>
            <Box flexDirection="row" gap="md" className={css.keyMetricsBox}>
                <TrendCard
                    withFixedWidth={false}
                    hint={{
                        title: 'Unique customers who received at least one message in this campaign. Shows audience size and helps normalise engagement metrics like CTR or reply rate.',
                    }}
                    currency={totalRecipients.currency}
                    isLoading={totalRecipients.isLoading}
                    metricFormat="decimal"
                    interpretAs={totalRecipients.interpretAs}
                    timeSeriesData={seriesToTwoDimensionalDataItem(
                        totalRecipients.series,
                    )}
                    trend={{
                        isError: false,
                        isFetching: totalRecipients.isLoading,
                        data: {
                            label: 'Total Recipients',
                            value: totalRecipients.value,
                            prevValue: totalRecipients.prevValue ?? null,
                        },
                    }}
                />
                <TrendCard
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
                    withFixedWidth={false}
                    hint={{
                        title: 'Percentage of recipients who completed a purchase after receiving a message. Connects message performance directly to revenue outcomes.',
                    }}
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
                <TrendCard
                    withFixedWidth={false}
                    hint={{
                        title: 'Average spend per order from customers influenced by this campaign. Used to understand purchasing behaviour and upsell effectiveness.',
                    }}
                    isLoading={averageOrderValue.isLoading}
                    metricFormat="currency"
                    currency={revenuePerRecipient.currency}
                    interpretAs={averageOrderValue.interpretAs}
                    timeSeriesData={seriesToTwoDimensionalDataItem(
                        averageOrderValue.series,
                    )}
                    trend={{
                        isError: false,
                        isFetching: averageOrderValue.isLoading,
                        data: {
                            label: 'Average Order Value',
                            value: averageOrderValue.value,
                            prevValue: averageOrderValue.prevValue ?? null,
                        },
                    }}
                />
                <TrendCard
                    withFixedWidth={false}
                    hint={{
                        title: 'Total revenue attributed to this campaign divided by the number of recipients. Normalises impact—useful for comparing campaign performance.',
                    }}
                    isLoading={revenuePerRecipient.isLoading}
                    metricFormat="currency"
                    currency={revenuePerRecipient.currency}
                    interpretAs={revenuePerRecipient.interpretAs}
                    timeSeriesData={seriesToTwoDimensionalDataItem(
                        revenuePerRecipient.series,
                    )}
                    trend={{
                        isError: false,
                        isFetching: revenuePerRecipient.isLoading,
                        data: {
                            label: 'Revenue Per Recipient',
                            value: revenuePerRecipient.value,
                            prevValue: revenuePerRecipient.prevValue ?? null,
                        },
                    }}
                />
                <TrendCard
                    withFixedWidth={false}
                    hint={{
                        title: 'TBD',
                    }}
                    isLoading={responseRate.isLoading}
                    metricFormat="percent"
                    interpretAs={responseRate.interpretAs}
                    timeSeriesData={seriesToTwoDimensionalDataItem(
                        responseRate.series,
                    )}
                    trend={{
                        isError: false,
                        isFetching: responseRate.isLoading,
                        data: {
                            label: 'Response Rate',
                            value: responseRate.value,
                            prevValue: responseRate.prevValue ?? null,
                        },
                    }}
                />
                <TrendCard
                    withFixedWidth={false}
                    hint={{
                        title: 'Percentage of recipients who clicked a link in the message. Shows how compelling your message and offer are.',
                    }}
                    isLoading={clickThroughRate.isLoading}
                    metricFormat="percent"
                    interpretAs={clickThroughRate.interpretAs}
                    timeSeriesData={seriesToTwoDimensionalDataItem(
                        clickThroughRate.series,
                    )}
                    trend={{
                        isError: false,
                        isFetching: clickThroughRate.isLoading,
                        data: {
                            label: 'Click Through Rate',
                            value: clickThroughRate.value,
                            prevValue: clickThroughRate.prevValue ?? null,
                        },
                    }}
                />
                <TrendCard
                    withFixedWidth={false}
                    hint={{
                        title: 'Percentage of recipients who unsubscribed after receiving a message. A leading indicator of audience fatigue or poor message relevance.',
                    }}
                    isLoading={optOutRate.isLoading}
                    metricFormat="percent"
                    interpretAs={optOutRate.interpretAs}
                    timeSeriesData={seriesToTwoDimensionalDataItem(
                        optOutRate.series,
                    )}
                    trend={{
                        isError: false,
                        isFetching: optOutRate.isLoading,
                        data: {
                            label: 'Opt-out Rate',
                            value: optOutRate.value,
                            prevValue: optOutRate.prevValue ?? null,
                        },
                    }}
                />
            </Box>
        </motion.div>
    )
}
