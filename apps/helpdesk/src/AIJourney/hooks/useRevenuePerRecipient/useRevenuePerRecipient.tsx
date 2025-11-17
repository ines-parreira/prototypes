import { useMemo } from 'react'

import type { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import {
    aiJourneyGmvInfluencedQueryFactory,
    aiJourneyGmvInfluencedTimeSeriesQuery,
    aiJourneyTotalUniqueContactsQueryFactory,
    aiJourneyTotalUniqueContactsTimeSeriesQuery,
} from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

const calculateRevenuePerRecipient = ({
    gmv,
    recipients,
}: {
    gmv: number | undefined | null
    recipients: number | undefined | null
}): number => {
    if (gmv && recipients) {
        return gmv / recipients
    }
    return 0
}

export const useRevenuePerRecipient = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    granularity: ReportingGranularity,
    journeyId?: string,
): MetricProps => {
    const { currency } = useCurrency()

    const { data: gmvData, isFetching: isFetchingGmv } = useMetricTrend(
        aiJourneyGmvInfluencedQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyId,
        ),
        aiJourneyGmvInfluencedQueryFactory(
            integrationId,
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
            journeyId,
        ),
    )

    const { data: recipientsData, isFetching: isFetchingRecipients } =
        useMetricTrend(
            aiJourneyTotalUniqueContactsQueryFactory(
                integrationId,
                filters,
                userTimezone,
                journeyId,
            ),
            aiJourneyTotalUniqueContactsQueryFactory(
                integrationId,
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                userTimezone,
                journeyId,
            ),
        )

    const value = useMemo(() => {
        return calculateRevenuePerRecipient({
            gmv: gmvData?.value,
            recipients: recipientsData?.value,
        })
    }, [gmvData, recipientsData])

    const prevValue = useMemo(() => {
        return calculateRevenuePerRecipient({
            gmv: gmvData?.prevValue,
            recipients: recipientsData?.prevValue,
        })
    }, [gmvData, recipientsData])

    const { data: gmvTimeSeriesData, isFetching: isFetchingGmvSeries } =
        useTimeSeries(
            aiJourneyGmvInfluencedTimeSeriesQuery(
                integrationId,
                filters,
                userTimezone,
                granularity,
                journeyId,
            ),
        )

    const {
        data: recipientsTimeSeriesData,
        isFetching: isFetchingRecipientsSeries,
    } = useTimeSeries(
        aiJourneyTotalUniqueContactsTimeSeriesQuery(
            integrationId,
            filters,
            userTimezone,
            granularity,
            journeyId,
        ),
    )

    const series = useMemo(() => {
        if (!gmvTimeSeriesData?.length || !recipientsTimeSeriesData?.length) {
            return []
        }

        return gmvTimeSeriesData[0].map((gmvDataPoint, index) => {
            const recipientsDataPoint = recipientsTimeSeriesData[0][index]
            return {
                ...gmvDataPoint,
                value: calculateRevenuePerRecipient({
                    gmv: gmvDataPoint.value,
                    recipients: recipientsDataPoint?.value,
                }),
            }
        })
    }, [gmvTimeSeriesData, recipientsTimeSeriesData])

    return {
        label: 'Revenue Per Recipient',
        value,
        prevValue,
        series,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        currency,
        isLoading:
            isFetchingGmv ||
            isFetchingRecipients ||
            isFetchingGmvSeries ||
            isFetchingRecipientsSeries,
    }
}
