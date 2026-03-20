import { useMemo, useState } from 'react'

import { useEffectOnce, useLocalStorage } from '@repo/hooks'
import { ConfigureMetricsModal, LineChart, TrendCard } from '@repo/reporting'
import type { MetricConfigItem, MetricTrendFormat } from '@repo/reporting'
import { motion } from 'framer-motion'
import moment from 'moment/moment'

import {
    Box,
    Button,
    Heading,
    LegacyLoadingSpinner as LoadingSpinner,
    SidePanelSize,
    Size,
} from '@gorgias/axiom'

import {
    AiJourneySankeyChart,
    AudienceHealthSection,
    DiscountCodesUsageSection,
} from 'AIJourney/components'
import {
    useAIJourneyConversionRate,
    useAIJourneyMessagesSent,
    useAIJourneyResponseRate,
    useAIJourneyTotalOrders,
    useAIJourneyTotalSales,
    useAverageOrderValue,
    useClickThroughRate,
    useRevenuePerRecipient,
} from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'
import { seriesToTwoDimensionalDataItem } from 'domains/reporting/hooks/useTimeSeries'

import { useStatsFilters } from '../../../domains/reporting/hooks/support-performance/useStatsFilters'
import { FilterKey } from '../../../domains/reporting/models/stat/types'
import { DrillDownModal } from '../../../domains/reporting/pages/common/drill-down/DrillDownModal'
import FiltersPanelWrapper from '../../../domains/reporting/pages/common/filters/FiltersPanelWrapper'
import { filterNonDraftCampaigns } from '../../../domains/reporting/pages/common/filters/JourneyCampaignsFilter'
import { useGetNamespacedShopNameForStore } from '../../../domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore'

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

    const isNothingSelected = useMemo(() => {
        const selectedFlowIds = statsFilters.journeyFlows?.values
        const selectedCampaignIds = statsFilters.journeyCampaigns?.values

        const journeyNothingSelected =
            selectedFlowIds?.length === 0 && selectedCampaignIds?.length === 0

        const handoverNothingSelected =
            statsFilters.handover !== undefined &&
            statsFilters.handover.values.length === 0

        return journeyNothingSelected || handoverNothingSelected
    }, [
        statsFilters.journeyFlows,
        statsFilters.journeyCampaigns,
        statsFilters.handover,
    ])

    const forceEmpty = isNothingSelected

    const totalSales = useAIJourneyTotalSales({
        integrationId,
        userTimezone,
        filters,
        currency,
        granularity,
        journeyIds: journeysIdsToFilter,
        forceEmpty,
    })

    const orders = useAIJourneyTotalOrders({
        integrationId,
        userTimezone,
        filters,
        granularity,
        shopName,
        journeyIds: journeysIdsToFilter,
        forceEmpty,
    })

    const conversionRate = useAIJourneyConversionRate({
        integrationId,
        userTimezone,
        filters,
        granularity,
        journeyIds: journeysIdsToFilter,
        forceEmpty,
    })

    const clickThroughRate = useClickThroughRate({
        integrationId,
        userTimezone,
        filters,
        granularity,
        shopName,
        journeyIds: journeysIdsToFilter,
        forceEmpty,
    })

    const responseRate = useAIJourneyResponseRate({
        integrationId,
        userTimezone,
        filters,
        granularity,
        journeyIds: journeysIdsToFilter,
        forceEmpty,
    })

    const totalMessagesSent = useAIJourneyMessagesSent({
        integrationId,
        userTimezone,
        filters,
        granularity,
        journeyIds: journeysIdsToFilter,
        forceEmpty,
    })

    const averageOrderValue = useAverageOrderValue({
        integrationId,
        userTimezone,
        filters,
        currency,
        granularity,
        journeyIds: journeysIdsToFilter,
        forceEmpty,
    })

    const revenuePerRecipient = useRevenuePerRecipient({
        integrationId,
        userTimezone,
        filters,
        currency,
        granularity,
        journeyIds: journeysIdsToFilter,
        forceEmpty,
    })

    const ordersDrillDown = useDrillDownModalTrigger({
        metricName: AIJourneyMetric.TotalOrders,
        integrationId,
        journeyIds: journeysIdsToFilter,
    })

    const seriesBaseOptions = {
        dateFormatter: (date: string) => moment(date).format('MMM D'),
        withEndPeriod: {
            include: true,
            endDate: filters.period.end_datetime,
        },
    }

    const metrics = [
        {
            id: 'Total sales',
            label: 'Total sales',
            currency: totalSales.currency,
            hint: 'Total value of orders placed within 5 days from receiving flow or campaign message.',
            withFixedWidth: true,
            interpretAs: totalSales.interpretAs,
            isLoading: totalSales.isLoading,
            metricFormat: 'currency' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(totalSales.series, {
                label: 'Total sales',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: totalSales.prevValue ?? null,
                value: totalSales.value,
            },
        },
        {
            id: 'Orders',
            label: 'Orders',
            currency: orders.currency,
            hint: 'Total number of orders placed by a customers within 5 days from receiving flow or campaign message.',
            withFixedWidth: true,
            interpretAs: orders.interpretAs,
            isLoading: orders.isLoading,
            metricFormat: 'decimal-precision-1' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(orders.series, {
                label: 'Orders',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: orders.prevValue ?? null,
                value: orders.value,
            },
            drillDown: ordersDrillDown,
        },
        {
            id: 'Conversion rate',
            label: 'Conversion rate',
            hint: 'Percentage of recipients who completed a purchase after receiving a message.',
            withFixedWidth: true,
            interpretAs: conversionRate.interpretAs,
            isLoading: conversionRate.isLoading,
            metricFormat: 'percent' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(conversionRate.series, {
                label: 'Conversion rate',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: conversionRate.prevValue ?? null,
                value: conversionRate.value,
            },
        },
        {
            id: 'Reply rate',
            label: 'Reply rate',
            hint: 'Percentage of recipients who responded to at least one message.',
            interpretAs: responseRate.interpretAs,
            isLoading: responseRate.isLoading,
            metricFormat: 'percent' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(responseRate.series, {
                label: 'Reply rate',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: responseRate.prevValue ?? null,
                value: responseRate.value,
            },
        },
        {
            id: 'Click-through rate (CTR)',
            label: 'Click-through rate (CTR)',
            hint: 'Percentage of recipients who clicked a link in the message.',
            interpretAs: clickThroughRate.interpretAs,
            isLoading: clickThroughRate.isLoading,
            metricFormat: 'percent' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(clickThroughRate.series, {
                label: 'Click-through rate (CTR)',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: clickThroughRate.prevValue ?? null,
                value: clickThroughRate.value,
            },
        },
        {
            id: 'Revenue per recipient',
            label: 'Revenue per recipient',
            currency: revenuePerRecipient.currency,
            hint: 'Revenue divided by recipients.',
            interpretAs: revenuePerRecipient.interpretAs,
            isLoading: revenuePerRecipient.isLoading,
            metricFormat: 'currency' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(revenuePerRecipient.series, {
                label: 'Revenue per recipient',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: revenuePerRecipient.prevValue ?? null,
                value: revenuePerRecipient.value,
            },
        },
        {
            id: 'Average Order Value (AOV)',
            label: 'Average Order Value (AOV)',
            currency: averageOrderValue.currency,
            hint: 'Average value per order. Calculated as revenue divided by Orders.',
            interpretAs: averageOrderValue.interpretAs,
            isLoading: averageOrderValue.isLoading,
            metricFormat: 'currency' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(averageOrderValue.series, {
                label: 'Average Order Value (AOV)',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: averageOrderValue.prevValue ?? null,
                value: averageOrderValue.value,
            },
        },
        {
            id: 'Messages sent',
            label: 'Messages sent',
            hint: 'The total number of messages successfully sent during the selected date range.',
            interpretAs: totalMessagesSent.interpretAs,
            isLoading: totalMessagesSent.isLoading,
            metricFormat: 'decimal' as MetricTrendFormat,
            series: seriesToTwoDimensionalDataItem(totalMessagesSent.series, {
                label: 'Messages sent',
                ...seriesBaseOptions,
            }),
            trend: {
                prevValue: totalMessagesSent.prevValue ?? null,
                value: totalMessagesSent.value,
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
        'Total sales',
        'Orders',
        'Conversion rate',
        'Reply rate',
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
    >('ai-journey-analytics-key-metrics-preferences', defaultMetricsConfig)

    useEffectOnce(() => {
        const legacyItemKey = 'ai-journey-analytics-metrics-preferences'
        if (localStorage.getItem(legacyItemKey))
            localStorage.removeItem(legacyItemKey)
    })

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
                        Edit key metrics
                    </Button>
                    <ConfigureMetricsModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        metrics={keyKpisConfig.map((config) => ({
                            ...config,
                            hint: metrics.find((m) => m.id === config.id)?.hint,
                        }))}
                        onSave={setKeyKpisConfig}
                        size={SidePanelSize.Md}
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
                                drillDown,
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
                                    drillDown={drillDown}
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
                <AiJourneySankeyChart
                    integrationId={integrationId}
                    userTimezone={userTimezone}
                    filters={filters}
                    journeyIds={journeysIdsToFilter}
                />
                <DiscountCodesUsageSection
                    integrationId={integrationId}
                    userTimezone={userTimezone}
                    filters={filters}
                    journeyIds={journeysIdsToFilter}
                    forceEmpty={forceEmpty}
                />
                <AudienceHealthSection
                    integrationId={integrationId}
                    userTimezone={userTimezone}
                    filters={filters}
                    shopName={shopName}
                    journeyIds={journeysIdsToFilter}
                    forceEmpty={forceEmpty}
                />
                <DrillDownModal />
            </Box>
        </motion.div>
    )
}
