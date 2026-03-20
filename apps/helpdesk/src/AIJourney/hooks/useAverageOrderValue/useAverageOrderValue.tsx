import { useMemo } from 'react'

import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import type { MetricProps } from 'AIJourney/types/AIJourneyTypes'
import {
    aiJourneyRevenueQueryFactory,
    aiJourneyRevenueTimeSeriesQuery,
    aiJourneyTotalNumberOfOrderQueryFactory,
    aiJourneyTotalNumberOfOrderTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

const calculateAverageOrderValue = ({
    gmv,
    orders,
}: {
    gmv: number | undefined | null
    orders: number | undefined | null
}): number => {
    if (gmv && orders) {
        return gmv / orders
    }
    return 0
}

type UseAverageOrderValueOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    currency: string
    granularity: ReportingGranularity
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useAverageOrderValue = ({
    integrationId,
    userTimezone,
    filters,
    currency,
    granularity,
    journeyIds,
    forceEmpty = false,
}: UseAverageOrderValueOptions): MetricProps => {
    const enabled = !forceEmpty

    const { data: gmvData, isFetching: isFetchingGmv } = useMetricTrend(
        aiJourneyRevenueQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        aiJourneyRevenueQueryFactory(
            integrationId,
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
            journeyIds,
        ),
        undefined,
        undefined,
        enabled,
    )

    const { data: ordersData, isFetching: isFetchingOrders } = useMetricTrend(
        aiJourneyTotalNumberOfOrderQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        aiJourneyTotalNumberOfOrderQueryFactory(
            integrationId,
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
            journeyIds,
        ),
        undefined,
        undefined,
        enabled,
    )

    const value = useMemo(() => {
        return calculateAverageOrderValue({
            gmv: gmvData?.value,
            orders: ordersData?.value,
        })
    }, [gmvData, ordersData])

    const prevValue = useMemo(() => {
        return calculateAverageOrderValue({
            gmv: gmvData?.prevValue,
            orders: ordersData?.prevValue,
        })
    }, [gmvData, ordersData])

    const { data: gmvTimeSeriesData, isFetching: isFetchingGmvSeries } =
        useTimeSeries(
            aiJourneyRevenueTimeSeriesQuery(
                integrationId,
                filters,
                userTimezone,
                granularity,
                journeyIds,
            ),
            undefined,
            enabled,
        )

    const { data: ordersTimeSeriesData, isFetching: isFetchingOrdersSeries } =
        useTimeSeries(
            aiJourneyTotalNumberOfOrderTimeSeriesQuery(
                integrationId,
                filters,
                userTimezone,
                granularity,
                journeyIds,
            ),
            undefined,
            enabled,
        )

    const series = useMemo(() => {
        if (!gmvTimeSeriesData?.length || !ordersTimeSeriesData?.length) {
            return []
        }

        return gmvTimeSeriesData[0].map((gmvDataPoint, index) => {
            const ordersDataPoint = ordersTimeSeriesData[0][index]
            return {
                ...gmvDataPoint,
                value: calculateAverageOrderValue({
                    gmv: gmvDataPoint.value,
                    orders: ordersDataPoint?.value,
                }),
            }
        })
    }, [gmvTimeSeriesData, ordersTimeSeriesData])

    return {
        label: 'Average Order Value',
        value: forceEmpty ? 0 : value,
        prevValue: forceEmpty ? 0 : prevValue,
        series: forceEmpty ? [] : series,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        currency,
        isLoading: forceEmpty
            ? false
            : isFetchingGmv ||
              isFetchingOrders ||
              isFetchingGmvSeries ||
              isFetchingOrdersSeries,
    }
}
