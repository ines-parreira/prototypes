import { useMemo } from 'react'

import type {
    MetricTrend,
    MetricTrendFormat,
    TooltipData,
    TrendDirection,
} from '@repo/reporting'

import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { calculateRate } from 'AIJourney/utils'
import {
    AIJourneyDiscountCodesOfferedQueryFactory,
    AIJourneyDiscountCodesUsedQueryFactory,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

type DiscountMetric = {
    trend: MetricTrend
    interpretAs: TrendDirection
    metricFormat: MetricTrendFormat
    hint: TooltipData
    drilldownMetricName?: AIJourneyMetric
}

const useDiscountCodesRateAppliedTrend = (
    offeredMetric: DiscountMetric,
    usedMetric: DiscountMetric,
): DiscountMetric => {
    const rateValue = useMemo(
        () =>
            calculateRate({
                numerator: usedMetric.trend.data?.value,
                denominator: offeredMetric.trend.data?.value,
            }),
        [usedMetric.trend.data?.value, offeredMetric.trend.data?.value],
    )

    const ratePrevValue = useMemo(
        () =>
            calculateRate({
                numerator: usedMetric.trend.data?.prevValue,
                denominator: offeredMetric.trend.data?.prevValue,
            }),
        [usedMetric.trend.data?.prevValue, offeredMetric.trend.data?.prevValue],
    )

    const isFetching =
        offeredMetric.trend.isFetching || usedMetric.trend.isFetching

    return {
        trend: {
            isFetching,
            isError: offeredMetric.trend.isError || usedMetric.trend.isError,
            data: {
                label: 'Discount code usage rate',
                value: isFetching ? null : rateValue,
                prevValue: isFetching ? null : ratePrevValue,
            },
        },
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
        hint: {
            title: 'The percentage of generated discount codes that were redeemed. Calculated as codes used divided by codes generated * 100.',
        },
    }
}

const useAIJourneyDiscountCodesOffered = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    journeyIds: string[],
): DiscountMetric => {
    const { data: trendData, isFetching: isFetchingTrend } = useMetricTrend(
        AIJourneyDiscountCodesOfferedQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        AIJourneyDiscountCodesOfferedQueryFactory(
            integrationId,
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
            journeyIds,
        ),
    )

    return {
        trend: {
            isFetching: isFetchingTrend,
            isError: false,
            data: {
                label: 'Discount codes generated',
                value: trendData?.value ?? null,
                prevValue: trendData?.prevValue ?? null,
            },
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        hint: {
            title: 'The total number of unique discount codes generated during selected date range.',
        },
        drilldownMetricName: AIJourneyMetric.DiscountCodesGenerated,
    }
}

const useAIJourneyDiscountCodesUsed = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    journeyIds: string[],
): DiscountMetric => {
    const { data: trendData, isFetching: isFetchingTrend } = useMetricTrend(
        AIJourneyDiscountCodesUsedQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        AIJourneyDiscountCodesUsedQueryFactory(
            integrationId,
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
            journeyIds,
        ),
    )

    return {
        trend: {
            isFetching: isFetchingTrend,
            isError: false,
            data: {
                label: 'Discount codes used',
                value: trendData?.value ?? null,
                prevValue: trendData?.prevValue ?? null,
            },
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        hint: {
            title: 'The number of discount codes that were redeemed by recipients.',
        },
        drilldownMetricName: AIJourneyMetric.DiscountCodesUsed,
    }
}

export const useAIJourneyDiscountCodeUsageMetrics = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    journeyIds: string[],
) => {
    const discountCodesOffered = useAIJourneyDiscountCodesOffered(
        integrationId,
        userTimezone,
        filters,
        journeyIds,
    )
    const discountCodesUsed = useAIJourneyDiscountCodesUsed(
        integrationId,
        userTimezone,
        filters,
        journeyIds,
    )
    const discountCodesRateApplied = useDiscountCodesRateAppliedTrend(
        discountCodesOffered,
        discountCodesUsed,
    )

    return [discountCodesOffered, discountCodesUsed, discountCodesRateApplied]
}
