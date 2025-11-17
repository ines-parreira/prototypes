import { useMemo, useState } from 'react'

import {
    LineChart,
    type MetricTrendFormat,
    TrendCard,
    type TwoDimensionalDataItem,
} from '@repo/reporting'
import { motion } from 'framer-motion'
import moment from 'moment/moment'

import {
    Box,
    Card,
    Heading,
    LegacyLoadingSpinner as LoadingSpinner,
} from '@gorgias/axiom'

import {
    useAIJourneyTotalConversations,
    useAverageOrderValue,
    useRevenuePerRecipient,
} from 'AIJourney/hooks'
import { useAIJourneyConversionRate } from 'AIJourney/hooks/useAIJourneyConversionRate/useAIJourneyConversionRate'
import { useAIJourneyGmvInfluenced } from 'AIJourney/hooks/useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced'
import { useJourneyContext } from 'AIJourney/providers'
import { seriesToTwoDimensionalDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

import { useCleanStatsFilters } from '../../../domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from '../../../domains/reporting/models/stat/types'
import { ReportingGranularity } from '../../../domains/reporting/models/types'
import FiltersPanelWrapper from '../../../domains/reporting/pages/common/filters/FiltersPanelWrapper'
import { useGetNamespacedShopNameForStore } from '../../../domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore'
import { useAIJourneyOptOutRate } from '../../hooks/useAIJourneyOptOutRate/useAIJourneyOptOutRate'
import { useAIJourneyResponseRate } from '../../hooks/useAIJourneyResponseRate/useAIJourneyResponseRate'
import { useClickThroughRate } from '../../hooks/useClickThroughRate/useClickThroughRate'

import css from './Analytics.less'

export const Analytics = () => {
    useCleanStatsFilters()
    const { isLoading, currentIntegration } = useJourneyContext()
    const integrationId = useMemo(() => {
        return (currentIntegration?.id || 0).toString()
    }, [currentIntegration])
    const { userTimezone, cleanStatsFilters } = useAppSelector(
        getCleanStatsFiltersWithTimezone,
    )
    const shopName = useGetNamespacedShopNameForStore(
        currentIntegration?.id ? [currentIntegration.id] : [],
    )

    const filters = {
        period: cleanStatsFilters.period,
    }
    const granularity =
        cleanStatsFilters.aggregationWindow ?? ReportingGranularity.Week

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

    const seriesBaseOptions = {
        dateFormatter: (date: string) => moment(date).format('MMM D'),
        withEndPeriod: {
            include: true,
            endDate: filters.period.end_datetime,
        },
    }

    const metrics: Record<
        string,
        {
            currency?: string
            hint: string
            inHeader?: boolean
            interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
            isLoading: boolean
            metricFormat: MetricTrendFormat
            series: TwoDimensionalDataItem[]
            trend: {
                prevValue: number | null
                value: number | null
            }
        }
    > = {
        'Total Recipients': {
            hint: 'Unique customers who received at least one message in this campaign. Shows audience size and helps normalise engagement metrics like CTR or reply rate.',
            interpretAs: totalRecipients.interpretAs,
            isLoading: totalRecipients.isLoading,
            metricFormat: 'decimal',
            series: seriesToTwoDimensionalDataItem(totalRecipients.series, {
                label: 'Total Recipients',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: totalRecipients.prevValue ?? null,
                value: totalRecipients.value,
            },
        },
        'GMV Influenced': {
            currency: gmvInfluenced.currency,
            hint: 'Total value of orders linked to customers who received messages during the campaign. Reflects the overall sales impact attributed to this flow.',
            inHeader: true,
            interpretAs: gmvInfluenced.interpretAs,
            isLoading: gmvInfluenced.isLoading,
            metricFormat: 'currency',
            series: seriesToTwoDimensionalDataItem(gmvInfluenced.series, {
                label: 'GMV Influenced',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: gmvInfluenced.prevValue ?? null,
                value: gmvInfluenced.value,
            },
        },
        'Conversion Rate': {
            hint: 'Percentage of recipients who completed a purchase after receiving a message. Connects message performance directly to revenue outcomes.',
            inHeader: true,
            interpretAs: conversionRate.interpretAs,
            isLoading: conversionRate.isLoading,
            metricFormat: 'percent',
            series: seriesToTwoDimensionalDataItem(conversionRate.series, {
                label: 'Conversion Rate',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: conversionRate.prevValue ?? null,
                value: conversionRate.value,
            },
        },
        'Average Order Value': {
            currency: averageOrderValue.currency,
            hint: 'Average spend per order from customers influenced by this campaign. Used to understand purchasing behaviour and upsell effectiveness.',
            interpretAs: averageOrderValue.interpretAs,
            isLoading: averageOrderValue.isLoading,
            metricFormat: 'currency',
            series: seriesToTwoDimensionalDataItem(averageOrderValue.series, {
                label: 'Average Order Value',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: averageOrderValue.prevValue ?? null,
                value: averageOrderValue.value,
            },
        },
        'Revenue Per Recipient': {
            currency: revenuePerRecipient.currency,
            hint: 'Total revenue attributed to this campaign divided by the number of recipients. Normalises impact—useful for comparing campaign performance.',
            interpretAs: revenuePerRecipient.interpretAs,
            isLoading: revenuePerRecipient.isLoading,
            metricFormat: 'currency',
            series: seriesToTwoDimensionalDataItem(revenuePerRecipient.series, {
                label: 'Revenue Per Recipient',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: revenuePerRecipient.prevValue ?? null,
                value: revenuePerRecipient.value,
            },
        },
        'Response Rate': {
            hint: 'Percentage of recipients who replied to at least one message. Indicates engagement and how conversational the campaign felt.',
            interpretAs: responseRate.interpretAs,
            isLoading: responseRate.isLoading,
            metricFormat: 'percent',
            series: seriesToTwoDimensionalDataItem(responseRate.series, {
                label: 'Response Rate',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: responseRate.prevValue ?? null,
                value: responseRate.value,
            },
        },
        'Click Through Rate': {
            hint: 'Percentage of recipients who clicked a link in the message. Shows how compelling your message and offer are.',
            interpretAs: clickThroughRate.interpretAs,
            isLoading: clickThroughRate.isLoading,
            metricFormat: 'percent',
            series: seriesToTwoDimensionalDataItem(clickThroughRate.series, {
                label: 'Click Through Rate',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: clickThroughRate.prevValue ?? null,
                value: clickThroughRate.value,
            },
        },
        'Opt-out Rate': {
            hint: 'Percentage of recipients who unsubscribed after receiving a message. A leading indicator of audience fatigue or poor message relevance.',
            interpretAs: optOutRate.interpretAs,
            isLoading: optOutRate.isLoading,
            metricFormat: 'percent',
            series: seriesToTwoDimensionalDataItem(optOutRate.series, {
                label: 'Opt-out Rate',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: optOutRate.prevValue ?? null,
                value: optOutRate.value,
            },
        },
    }

    const [title, setTitle] = useState(Object.keys(metrics)[0])
    const metricsLabels = Object.keys(metrics).map((metric) => ({
        id: metric,
        label: metric,
    }))
    const selectedData = metrics[title]

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

            <div>
                <FiltersPanelWrapper
                    persistentFilters={[
                        FilterKey.Period,
                        FilterKey.AggregationWindow,
                    ]}
                    withSavedFilters={false}
                    filterSettingsOverrides={{
                        [FilterKey.Period]: {
                            initialSettings: {
                                maxSpan: 365,
                            },
                        },
                    }}
                />
            </div>

            <Card flexDirection="row" width="100%" gap="xxxl" padding="xl">
                {Object.entries(metrics)
                    .filter(([, { inHeader }]) => inHeader)
                    .map(
                        ([
                            label,
                            {
                                currency,
                                metricFormat,
                                hint,
                                interpretAs,
                                isLoading,
                                trend,
                                series,
                            },
                        ]) => (
                            <TrendCard
                                key={`header-metric-${label}`}
                                withBorder={false}
                                withFixedWidth={false}
                                hint={{
                                    title: hint,
                                }}
                                currency={currency}
                                isLoading={isLoading}
                                metricFormat={metricFormat}
                                interpretAs={interpretAs}
                                timeSeriesData={series}
                                trend={{
                                    isError: false,
                                    isFetching: isLoading,
                                    data: {
                                        label: label,
                                        value: trend.value,
                                        prevValue: trend.prevValue,
                                    },
                                }}
                            />
                        ),
                    )}
            </Card>

            <Heading size="md">Key metrics</Heading>

            <Box flexDirection="row" gap="md" className={css.keyMetricsBox}>
                {Object.entries(metrics).map(
                    ([
                        label,
                        {
                            currency,
                            metricFormat,
                            hint,
                            interpretAs,
                            isLoading,
                            trend,
                            series,
                        },
                    ]) => (
                        <TrendCard
                            key={`key-metric-${label}`}
                            currency={currency}
                            withFixedWidth={false}
                            hint={{
                                title: hint,
                            }}
                            isLoading={isLoading}
                            metricFormat={metricFormat}
                            interpretAs={interpretAs}
                            timeSeriesData={series}
                            trend={{
                                isError: false,
                                isFetching: isLoading,
                                data: {
                                    label: label,
                                    value: trend.value,
                                    prevValue: trend.prevValue ?? null,
                                },
                            }}
                        />
                    ),
                )}
            </Box>

            <LineChart
                onMetricChange={setTitle}
                metrics={metricsLabels}
                title={title}
                containerHeight={320}
                isLoading={selectedData.isLoading}
                metricFormat={selectedData.metricFormat}
                data={selectedData.series}
            />
        </motion.div>
    )
}
