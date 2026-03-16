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

export const useAverageOrderValue = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    currency: string,
    granularity: ReportingGranularity,
    journeyIds?: string[],
): MetricProps => {
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
        value,
        prevValue,
        series,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        currency,
        isLoading:
            isFetchingGmv ||
            isFetchingOrders ||
            isFetchingGmvSeries ||
            isFetchingOrdersSeries,
    }
}
