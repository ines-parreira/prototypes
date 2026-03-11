import { useMemo, useState } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { ConfigureMetricsModal, LineChart, TrendCard } from '@repo/reporting'
import type { MetricConfigItem, MetricTrendFormat } from '@repo/reporting'
import { motion } from 'framer-motion'
import moment from 'moment/moment'

import {
    Box,
    Button,
    Heading,
    LegacyLoadingSpinner as LoadingSpinner,
    Size,
} from '@gorgias/axiom'

import { DiscountCodesUsageSection } from 'AIJourney/components'
import {
    useAIJourneyTotalConversations,
    useAverageOrderValue,
    useRevenuePerRecipient,
} from 'AIJourney/hooks'
import { useAIJourneyConversionRate } from 'AIJourney/hooks/useAIJourneyConversionRate/useAIJourneyConversionRate'
import { useAIJourneyGmvInfluenced } from 'AIJourney/hooks/useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced'
import { useJourneyContext } from 'AIJourney/providers'
import { seriesToTwoDimensionalDataItem } from 'domains/reporting/hooks/useTimeSeries'

import { useStatsFilters } from '../../../domains/reporting/hooks/support-performance/useStatsFilters'
import { FilterKey } from '../../../domains/reporting/models/stat/types'
import { DrillDownModal } from '../../../domains/reporting/pages/common/drill-down/DrillDownModal'
import FiltersPanelWrapper from '../../../domains/reporting/pages/common/filters/FiltersPanelWrapper'
import { filterNonDraftCampaigns } from '../../../domains/reporting/pages/common/filters/JourneyCampaignsFilter'
import { useGetNamespacedShopNameForStore } from '../../../domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore'
import { useAIJourneyOptOutRate } from '../../hooks/useAIJourneyOptOutRate/useAIJourneyOptOutRate'
import { useAIJourneyResponseRate } from '../../hooks/useAIJourneyResponseRate/useAIJourneyResponseRate'
import { useClickThroughRate } from '../../hooks/useClickThroughRate/useClickThroughRate'

import css from './Analytics.less'

export const Analytics = () => {
    const {
        cleanStatsFilters: statsFilters,
        userTimezone,
        granularity,
    } = useStatsFilters()
    const { journeys, campaigns, currency, isLoading, currentIntegration } =
        useJourneyContext()
    const integrationId = useMemo(() => {
        return (currentIntegration?.id || 0).toString()
    }, [currentIntegration])
    const shopName = useGetNamespacedShopNameForStore(
        currentIntegration?.id ? [currentIntegration.id] : [],
    )

    const filters = {
        period: statsFilters.period,
        handover: statsFilters.handover,
    }

    const nonDraftCampaigns = useMemo(
        () => filterNonDraftCampaigns(campaigns ?? []),
        [campaigns],
    )

    const allFlowIds = useMemo(
        () => journeys?.map((j) => j.id) ?? [],
        [journeys],
    )
    const allCampaignIds = useMemo(
        () => nonDraftCampaigns.map((c) => c.id),
        [nonDraftCampaigns],
    )

    const journeysIdsToFilter = useMemo(() => {
        const selectedFlowIds = statsFilters.journeyFlows?.values
        const selectedCampaignIds = statsFilters.journeyCampaigns?.values

        const allFlowsSelected =
            !selectedFlowIds || selectedFlowIds.length === allFlowIds.length
        const allCampaignsSelected =
            !selectedCampaignIds ||
            selectedCampaignIds.length === allCampaignIds.length

        if (allFlowsSelected && allCampaignsSelected) return []

        const flows = selectedFlowIds ?? allFlowIds
        const cmpgns = selectedCampaignIds ?? allCampaignIds
        return [...flows, ...cmpgns]
    }, [
        statsFilters.journeyFlows,
        statsFilters.journeyCampaigns,
        allFlowIds,
        allCampaignIds,
    ])

    const gmvInfluenced = useAIJourneyGmvInfluenced(
        integrationId,
        userTimezone,
        filters,
        currency,
        granularity,
        journeysIdsToFilter,
    )
    const conversionRate = useAIJourneyConversionRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        journeysIdsToFilter,
    )

    const optOutRate = useAIJourneyOptOutRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        shopName,
        journeysIdsToFilter,
    )
    const clickThroughRate = useClickThroughRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        shopName,
        journeysIdsToFilter,
    )

    const responseRate = useAIJourneyResponseRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        journeysIdsToFilter,
    )

    const totalRecipients = useAIJourneyTotalConversations(
        integrationId,
        userTimezone,
        filters,
        granularity,
        journeysIdsToFilter,
    )

    const averageOrderValue = useAverageOrderValue(
        integrationId,
        userTimezone,
        filters,
        currency,
        granularity,
        journeysIdsToFilter,
    )
    const revenuePerRecipient = useRevenuePerRecipient(
        integrationId,
        userTimezone,
        filters,
        currency,
        granularity,
        journeysIdsToFilter,
    )

    const seriesBaseOptions = {
        dateFormatter: (date: string) => moment(date).format('MMM D'),
        withEndPeriod: {
            include: true,
            endDate: filters.period.end_datetime,
        },
    }

    const metrics = [
        {
            id: 'Total Recipients',
            label: 'Total Recipients',
            hint: 'Unique customers who received at least one message in this campaign. Shows audience size and helps normalise engagement metrics like CTR or reply rate.',
            interpretAs: totalRecipients.interpretAs,
            isLoading: totalRecipients.isLoading,
            metricFormat: 'decimal' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(totalRecipients.series, {
                label: 'Total Recipients',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: totalRecipients.prevValue ?? null,
                value: totalRecipients.value,
            },
        },
        {
            id: 'GMV Influenced',
            label: 'GMV Influenced',
            currency: gmvInfluenced.currency,
            hint: 'Total value of orders linked to customers who received messages during the campaign. Reflects the overall sales impact attributed to this flow.',
            withFixedWidth: true,
            interpretAs: gmvInfluenced.interpretAs,
            isLoading: gmvInfluenced.isLoading,
            metricFormat: 'currency' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(gmvInfluenced.series, {
                label: 'GMV Influenced',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: gmvInfluenced.prevValue ?? null,
                value: gmvInfluenced.value,
            },
        },
        {
            id: 'Conversion Rate',
            label: 'Conversion Rate',
            hint: 'Percentage of recipients who completed a purchase after receiving a message. Connects message performance directly to revenue outcomes.',
            withFixedWidth: true,
            interpretAs: conversionRate.interpretAs,
            isLoading: conversionRate.isLoading,
            metricFormat: 'percent' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(conversionRate.series, {
                label: 'Conversion Rate',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: conversionRate.prevValue ?? null,
                value: conversionRate.value,
            },
        },
        {
            id: 'Average Order Value',
            label: 'Average Order Value',
            currency: averageOrderValue.currency,
            hint: 'Average spend per order from customers influenced by this campaign. Used to understand purchasing behaviour and upsell effectiveness.',
            interpretAs: averageOrderValue.interpretAs,
            isLoading: averageOrderValue.isLoading,
            metricFormat: 'currency' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(averageOrderValue.series, {
                label: 'Average Order Value',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: averageOrderValue.prevValue ?? null,
                value: averageOrderValue.value,
            },
        },
        {
            id: 'Revenue Per Recipient',
            label: 'Revenue Per Recipient',
            currency: revenuePerRecipient.currency,
            hint: 'Total revenue attributed to this campaign divided by the number of recipients. Normalises impact—useful for comparing campaign performance.',
            interpretAs: revenuePerRecipient.interpretAs,
            isLoading: revenuePerRecipient.isLoading,
            metricFormat: 'currency' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(revenuePerRecipient.series, {
                label: 'Revenue Per Recipient',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: revenuePerRecipient.prevValue ?? null,
                value: revenuePerRecipient.value,
            },
        },
        {
            id: 'Response Rate',
            label: 'Response Rate',
            hint: 'Percentage of recipients who replied to at least one message. Indicates engagement and how conversational the campaign felt.',
            interpretAs: responseRate.interpretAs,
            isLoading: responseRate.isLoading,
            metricFormat: 'percent' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(responseRate.series, {
                label: 'Response Rate',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: responseRate.prevValue ?? null,
                value: responseRate.value,
            },
        },
        {
            id: 'Click Through Rate',
            label: 'Click Through Rate',
            hint: 'Percentage of recipients who clicked a link in the message. Shows how compelling your message and offer are.',
            interpretAs: clickThroughRate.interpretAs,
            isLoading: clickThroughRate.isLoading,
            metricFormat: 'percent' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(clickThroughRate.series, {
                label: 'Click Through Rate',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: clickThroughRate.prevValue ?? null,
                value: clickThroughRate.value,
            },
        },
        {
            id: 'Opt-out Rate',
            label: 'Opt-out Rate',
            hint: 'Percentage of recipients who unsubscribed after receiving a message. A leading indicator of audience fatigue or poor message relevance.',
            interpretAs: optOutRate.interpretAs,
            isLoading: optOutRate.isLoading,
            metricFormat: 'percent' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(optOutRate.series, {
                label: 'Opt-out Rate',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: optOutRate.prevValue ?? null,
                value: optOutRate.value,
            },
        },
    ]

    const [title, setTitle] = useState(metrics[0].id)
    const metricsLabels = metrics.map(({ id, label }) => ({
        id,
        label,
    }))
    const selectedData = metrics.find((m) => m.id === title)

    const defaultVisibleMetrics = new Set([
        'Click Through Rate',
        'Response Rate',
        'Total Recipients',
        'Revenue Per Recipient',
    ])
    const defaultMetricsConfig: MetricConfigItem[] = metrics.map(
        ({ id, label }) => ({
            id,
            label,
            visibility: defaultVisibleMetrics.has(id),
        }),
    )

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [keyKpisConfig, setKeyKpisConfig] = useLocalStorage<
        MetricConfigItem[]
    >('ai-journey-analytics-metrics-preferences', defaultMetricsConfig)

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <motion.div
            className={css.container}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Heading size="md">AI Journey Analytics</Heading>

            <div>
                <FiltersPanelWrapper
                    persistentFilters={[
                        FilterKey.Period,
                        FilterKey.AggregationWindow,
                        FilterKey.JourneyFlows,
                        FilterKey.JourneyCampaigns,
                        FilterKey.Handover,
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

            <Box flexDirection="column" gap={Size.Lg}>
                <Box flexDirection="row" justifyContent="space-between">
                    <Heading size="md">Key metrics</Heading>
                    <Button
                        leadingSlot="columns"
                        variant="tertiary"
                        as="button"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        Edit metrics
                    </Button>
                    <ConfigureMetricsModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        metrics={keyKpisConfig.map((config) => ({
                            ...config,
                            hint: metrics.find((m) => m.id === config.id)?.hint,
                        }))}
                        onSave={setKeyKpisConfig}
                    />
                </Box>

                <Box flexDirection="row" gap="md" className={css.keyMetricsBox}>
                    {keyKpisConfig
                        .filter((config) => config.visibility)
                        .map((config) => {
                            const metricData = metrics.find(
                                (m) => m.id === config.id,
                            )
                            if (!metricData) return null

                            const {
                                currency,
                                metricFormat,
                                hint,
                                interpretAs,
                                isLoading,
                                trend,
                            } = metricData

                            return (
                                <TrendCard
                                    key={`key-metric-${config.id}`}
                                    currency={currency}
                                    withFixedWidth={false}
                                    hint={{
                                        title: hint,
                                    }}
                                    isLoading={isLoading}
                                    metricFormat={metricFormat}
                                    interpretAs={interpretAs}
                                    trend={{
                                        isError: false,
                                        isFetching: isLoading,
                                        data: {
                                            label: config.label,
                                            value: trend.value,
                                            prevValue: trend.prevValue ?? null,
                                        },
                                    }}
                                />
                            )
                        })}
                </Box>

                {selectedData && (
                    <LineChart
                        variant="area"
                        onMetricChange={setTitle}
                        metrics={metricsLabels}
                        title={title}
                        containerHeight={320}
                        isLoading={selectedData.isLoading}
                        metricFormat={selectedData.metricFormat}
                        data={selectedData.series}
                    />
                )}
                <DiscountCodesUsageSection
                    integrationId={integrationId}
                    userTimezone={userTimezone}
                    filters={filters}
                    journeyIds={journeysIdsToFilter}
                />
                <DrillDownModal />
            </Box>
        </motion.div>
    )
}
