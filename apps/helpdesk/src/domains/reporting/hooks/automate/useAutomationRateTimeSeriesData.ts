import { useMemo } from 'react'

import { automationRateUnfilteredDenominator } from 'domains/reporting/hooks/automate/automateStatsFormulae'
import {
    fetchAutomationDatasetTimeSeries,
    fetchBillableTicketDatasetTimeSeries,
    useAutomationDatasetTimeSeries,
    useBillableTicketDatasetTimeSeries,
} from 'domains/reporting/hooks/automate/timeSeries'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { getAutomateStatsByMeasure } from 'domains/reporting/hooks/automate/utils'
import { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { BillableTicketDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/BillableTicketDatasetCube'
import { FilterKey, StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AUTOMATION_RATE_LABEL } from 'pages/automate/automate-metrics/constants'

export const useAutomationRateTimeSeriesData = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const onlyPeriodFilter = useMemo(
        () => ({ [FilterKey.Period]: filters.period }),
        [filters.period],
    )
    const filteredAutomatedInteractionsData = useAutomationDatasetTimeSeries(
        filters,
        timezone,
        granularity,
    )
    const allAutomatedInteractionsData = useAutomationDatasetTimeSeries(
        onlyPeriodFilter,
        timezone,
        granularity,
    )

    const allAutomatedInteractionsSeries = getAutomateStatsByMeasure(
        AutomationDatasetMeasure.AutomatedInteractions,
        allAutomatedInteractionsData.data,
    )

    const allAutomatedInteractionsByAutoRespondersSeries =
        getAutomateStatsByMeasure(
            AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
            allAutomatedInteractionsData.data,
        )
    const billableTicketData = useBillableTicketDatasetTimeSeries(
        filters,
        timezone,
        granularity,
        aiAgentUserId,
    )
    const billableTicketCountsSeries = getAutomateStatsByMeasure(
        BillableTicketDatasetMeasure.BillableTicketCount,
        billableTicketData.data,
    )
    const filteredAutomatedInteractionsSeries = getAutomateStatsByMeasure(
        AutomationDatasetMeasure.AutomatedInteractions,
        filteredAutomatedInteractionsData.data,
    )
    const automationRates: TimeSeriesDataItem[] = useMemo(() => {
        const rates: TimeSeriesDataItem[] = []
        if (
            filteredAutomatedInteractionsData.isFetched &&
            billableTicketData.isFetched &&
            allAutomatedInteractionsData.isFetched &&
            filteredAutomatedInteractionsSeries?.length &&
            billableTicketCountsSeries?.length
        ) {
            filteredAutomatedInteractionsSeries?.forEach(
                (timeSeries, index) => {
                    const filteredAutomatedInteractions = timeSeries.value
                    const billableTicketCount =
                        billableTicketCountsSeries?.[index].value
                    const allAutomatedInteractions =
                        allAutomatedInteractionsSeries?.[index].value
                    const allAutomatedInteractionsByAutoResponders =
                        allAutomatedInteractionsByAutoRespondersSeries?.[index]
                            .value

                    rates.push({
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
        return rates
    }, [
        allAutomatedInteractionsByAutoRespondersSeries,
        allAutomatedInteractionsData.isFetched,
        allAutomatedInteractionsSeries,
        billableTicketCountsSeries,
        billableTicketData.isFetched,
        filteredAutomatedInteractionsData.isFetched,
        filteredAutomatedInteractionsSeries,
    ])

    const isFetching =
        filteredAutomatedInteractionsData.isFetching ||
        allAutomatedInteractionsData.isFetching ||
        billableTicketData.isFetching
    const isError =
        filteredAutomatedInteractionsData.isError ||
        allAutomatedInteractionsData.isError ||
        billableTicketData.isError

    return useMemo(
        () => ({ data: [automationRates], isFetching, isError }),
        [automationRates, isError, isFetching],
    )
}

export const fetchAutomationRateTimeSeriesData = async (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    aiAgentUserId: number | undefined,
) => {
    const onlyPeriodFilter = { [FilterKey.Period]: filters.period }

    return Promise.all([
        fetchAutomationDatasetTimeSeries(filters, timezone, granularity),
        fetchAutomationDatasetTimeSeries(
            onlyPeriodFilter,
            timezone,
            granularity,
        ),
        fetchBillableTicketDatasetTimeSeries(
            filters,
            timezone,
            granularity,
            aiAgentUserId,
        ),
    ]).then(
        ([
            filteredAutomatedInteractionsData,
            allAutomatedInteractionsData,
            billableTicketData,
        ]) => {
            const allAutomatedInteractionsSeries = getAutomateStatsByMeasure(
                AutomationDatasetMeasure.AutomatedInteractions,
                allAutomatedInteractionsData,
            )

            const allAutomatedInteractionsByAutoRespondersSeries =
                getAutomateStatsByMeasure(
                    AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
                    allAutomatedInteractionsData,
                )

            const billableTicketCountsSeries = getAutomateStatsByMeasure(
                BillableTicketDatasetMeasure.BillableTicketCount,
                billableTicketData,
            )
            const filteredAutomatedInteractionsSeries =
                getAutomateStatsByMeasure(
                    AutomationDatasetMeasure.AutomatedInteractions,
                    filteredAutomatedInteractionsData,
                )

            const automationRates: TimeSeriesDataItem[] = []
            if (
                filteredAutomatedInteractionsSeries?.length &&
                billableTicketCountsSeries?.length
            ) {
                filteredAutomatedInteractionsSeries?.forEach(
                    (timeSeries, index) => {
                        const filteredAutomatedInteractions = timeSeries.value
                        const billableTicketCount =
                            billableTicketCountsSeries?.[index].value
                        const allAutomatedInteractions =
                            allAutomatedInteractionsSeries?.[index].value
                        const allAutomatedInteractionsByAutoResponders =
                            allAutomatedInteractionsByAutoRespondersSeries?.[
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
