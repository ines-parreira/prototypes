import { useMemo } from 'react'

import { automationRateUnfilteredDenominator } from 'domains/reporting/hooks/automate/automateStatsFormulae'
import {
    fetchBillableTicketDatasetTimeSeries,
    useBillableTicketDatasetTimeSeries,
} from 'domains/reporting/hooks/automate/timeSeries'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    fetchTimeSeries,
    useTimeSeries,
} from 'domains/reporting/hooks/useTimeSeries'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { aiAgentInteractionsTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/timeseries'
import { aiAgentAutomatedInteractionsTimeSeriesQueryV2Factory } from 'domains/reporting/models/scopes/automatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { AUTOMATION_RATE_LABEL } from 'pages/automate/automate-metrics/constants'

export const useAIAgentAutomationRateTimeSeriesData = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const onlyPeriodFilter = useMemo(
        () => ({ [FilterKey.Period]: filters.period }),
        [filters.period],
    )

    const filteredAIAgentInteractionsData = useTimeSeries(
        aiAgentInteractionsTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
        ),
        aiAgentAutomatedInteractionsTimeSeriesQueryV2Factory({
            filters,
            timezone,
            granularity,
        }),
    )

    const allAIAgentInteractionsData = useTimeSeries(
        aiAgentInteractionsTimeSeriesQueryFactory(
            onlyPeriodFilter,
            timezone,
            granularity,
        ),
        aiAgentAutomatedInteractionsTimeSeriesQueryV2Factory({
            filters: onlyPeriodFilter,
            timezone,
            granularity,
        }),
    )

    const allAIAgentInteractionsSeries = allAIAgentInteractionsData.data[0]
    const allAIAgentInteractionsByAutoRespondersSeries =
        allAIAgentInteractionsData.data[1]

    const billableTicketData = useBillableTicketDatasetTimeSeries(
        filters,
        timezone,
        granularity,
        aiAgentUserId,
    )

    const billableTicketCountsSeries = billableTicketData.data[0]
    const filteredAIAgentInteractionsSeries =
        filteredAIAgentInteractionsData.data[0]

    const automationRates: TimeSeriesDataItem[] = useMemo(() => {
        const rates: TimeSeriesDataItem[] = []
        if (
            filteredAIAgentInteractionsData.isFetched &&
            billableTicketData.isFetched &&
            allAIAgentInteractionsData.isFetched &&
            filteredAIAgentInteractionsSeries.length &&
            billableTicketCountsSeries.length
        ) {
            filteredAIAgentInteractionsSeries?.forEach((timeSeries, index) => {
                const filteredAutomatedInteractions = timeSeries.value
                const billableTicketCount =
                    billableTicketCountsSeries?.[index].value
                const allAutomatedInteractions =
                    allAIAgentInteractionsSeries?.[index].value
                const allAutomatedInteractionsByAutoResponders =
                    allAIAgentInteractionsByAutoRespondersSeries?.[index].value

                rates.push({
                    dateTime: timeSeries.dateTime,
                    value: automationRateUnfilteredDenominator({
                        filteredAutomatedInteractions,
                        allAutomatedInteractions: allAutomatedInteractions,
                        allAutomatedInteractionsByAutoResponders:
                            allAutomatedInteractionsByAutoResponders,
                        billableTicketsCount: billableTicketCount,
                    }),
                    label: AUTOMATION_RATE_LABEL,
                })
            })
        }
        return rates
    }, [
        allAIAgentInteractionsByAutoRespondersSeries,
        allAIAgentInteractionsData.isFetched,
        allAIAgentInteractionsSeries,
        billableTicketCountsSeries,
        billableTicketData.isFetched,
        filteredAIAgentInteractionsData.isFetched,
        filteredAIAgentInteractionsSeries,
    ])

    const isFetching =
        filteredAIAgentInteractionsData.isFetching ||
        allAIAgentInteractionsData.isFetching ||
        billableTicketData.isFetching
    const isError =
        filteredAIAgentInteractionsData.isError ||
        allAIAgentInteractionsData.isError ||
        billableTicketData.isError

    return useMemo(
        () => ({ data: [automationRates], isFetching, isError }),
        [automationRates, isError, isFetching],
    )
}

export const fetchAIAgentAutomationRateTimeSeriesData = async (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    aiAgentUserId: number | undefined,
) => {
    const onlyPeriodFilter = { [FilterKey.Period]: filters.period }

    return Promise.all([
        fetchTimeSeries(
            aiAgentInteractionsTimeSeriesQueryFactory(
                filters,
                timezone,
                granularity,
            ),
            aiAgentAutomatedInteractionsTimeSeriesQueryV2Factory({
                filters,
                timezone,
                granularity,
            }),
        ),
        fetchTimeSeries(
            aiAgentInteractionsTimeSeriesQueryFactory(
                onlyPeriodFilter,
                timezone,
                granularity,
            ),
            aiAgentAutomatedInteractionsTimeSeriesQueryV2Factory({
                filters: onlyPeriodFilter,
                timezone,
                granularity,
            }),
        ),
        fetchBillableTicketDatasetTimeSeries(
            filters,
            timezone,
            granularity,
            aiAgentUserId,
        ),
    ]).then(
        ([
            filteredAIAgentInteractionsData,
            allAIAgentInteractionsData,
            billableTicketData,
        ]) => {
            const allAIAgentInteractionsSeries = allAIAgentInteractionsData[0]

            const allAIAgentInteractionsByAutoRespondersSeries =
                allAIAgentInteractionsData[1]

            const billableTicketCountsSeries = billableTicketData[0]

            const filteredAIAgentInteractionsSeries =
                filteredAIAgentInteractionsData[0]

            const automationRates: TimeSeriesDataItem[] = []
            if (
                filteredAIAgentInteractionsSeries.length &&
                billableTicketCountsSeries.length
            ) {
                filteredAIAgentInteractionsSeries?.forEach(
                    (timeSeries, index) => {
                        const filteredAutomatedInteractions = timeSeries.value
                        const billableTicketCount =
                            billableTicketCountsSeries?.[index].value
                        const allAutomatedInteractions =
                            allAIAgentInteractionsSeries?.[index].value
                        const allAutomatedInteractionsByAutoResponders =
                            allAIAgentInteractionsByAutoRespondersSeries?.[
                                index
                            ].value

                        automationRates.push({
                            dateTime: timeSeries.dateTime,
                            value: automationRateUnfilteredDenominator({
                                filteredAutomatedInteractions,
                                allAutomatedInteractions,
                                allAutomatedInteractionsByAutoResponders,
                                billableTicketsCount: billableTicketCount,
                            }),
                            label: AUTOMATION_RATE_LABEL,
                        })
                    },
                )
            }

            return {
                data: [automationRates],
                isFetching: false,
                isError: false,
            }
        },
    )
}
