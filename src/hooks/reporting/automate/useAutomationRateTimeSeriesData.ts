import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    automationRate,
    automationRateUnfilteredDenominator,
} from 'hooks/reporting/automate/automateStatsFormulae'
import {
    fetchAutomationDatasetTimeSeries,
    fetchBillableTicketDatasetTimeSeries,
    useAutomationDatasetTimeSeries,
    useBillableTicketDatasetTimeSeries,
} from 'hooks/reporting/automate/timeSeries'
import {useAIAgentUserId} from 'hooks/reporting/automate/useAIAgentUserId'
import {getAutomateStatsByMeasure} from 'hooks/reporting/automate/utils'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'

import {AutomationDatasetMeasure} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {BillableTicketDatasetMeasure} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import {ReportingGranularity} from 'models/reporting/types'
import {FilterKey, StatsFilters} from 'models/stat/types'
import {AUTOMATION_RATE_LABEL} from 'pages/automate/automate-metrics/constants'

export const useAutomationRateTimeSeriesData = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) => {
    const isAutomateNonFilteredDenominatorInAutomationRate:
        | boolean
        | undefined =
        useFlags()[
            FeatureFlagKey.AutomateNonFilteredDenominatorInAutomationRate
        ]
    const aiAgentUserId = useAIAgentUserId()
    const onlyPeriodFilter = useMemo(
        () => ({[FilterKey.Period]: filters.period}),
        [filters.period]
    )
    const filteredAutomatedInteractionsData = useAutomationDatasetTimeSeries(
        filters,
        timezone,
        granularity
    )
    const allAutomatedInteractionsData = useAutomationDatasetTimeSeries(
        onlyPeriodFilter,
        timezone,
        granularity
    )
    const filteredInteractionsByAutoRespondersSeries =
        getAutomateStatsByMeasure(
            AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
            filteredAutomatedInteractionsData.data
        )

    const allAutomatedInteractionsSeries = getAutomateStatsByMeasure(
        AutomationDatasetMeasure.AutomatedInteractions,
        allAutomatedInteractionsData.data
    )

    const allAutomatedInteractionsByAutoRespondersSeries =
        getAutomateStatsByMeasure(
            AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
            allAutomatedInteractionsData.data
        )
    const billableTicketData = useBillableTicketDatasetTimeSeries(
        filters,
        timezone,
        granularity,
        aiAgentUserId
    )
    const billableTicketCountsSeries = getAutomateStatsByMeasure(
        BillableTicketDatasetMeasure.BillableTicketCount,
        billableTicketData.data
    )
    const filteredAutomatedInteractionsSeries = getAutomateStatsByMeasure(
        AutomationDatasetMeasure.AutomatedInteractions,
        filteredAutomatedInteractionsData.data
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
                    const filteredAutomatedInteractionsByAutoResponders =
                        filteredInteractionsByAutoRespondersSeries?.[index]
                            .value
                    const billableTicketCount =
                        billableTicketCountsSeries?.[index].value
                    const allAutomatedInteractions =
                        allAutomatedInteractionsSeries?.[index].value
                    const allAutomatedInteractionsByAutoResponders =
                        allAutomatedInteractionsByAutoRespondersSeries?.[index]
                            .value

                    rates.push({
                        dateTime: timeSeries.dateTime,
                        value: isAutomateNonFilteredDenominatorInAutomationRate
                            ? automationRateUnfilteredDenominator({
                                  filteredAutomatedInteractions,
                                  allAutomatedInteractions,
                                  allAutomatedInteractionsByAutoResponders,
                                  billableTicketsCount: billableTicketCount,
                              })
                            : automationRate(
                                  filteredAutomatedInteractions,
                                  billableTicketCount,
                                  filteredAutomatedInteractionsByAutoResponders
                              ),
                        label: AUTOMATION_RATE_LABEL,
                    })
                }
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
        filteredInteractionsByAutoRespondersSeries,
        isAutomateNonFilteredDenominatorInAutomationRate,
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
        () => ({data: [automationRates], isFetching, isError}),
        [automationRates, isError, isFetching]
    )
}

export const fetchAutomationRateTimeSeriesData = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    isAutomateNonFilteredDenominatorInAutomationRate: boolean | undefined,
    aiAgentUserId: string | undefined
) => {
    const onlyPeriodFilter = {[FilterKey.Period]: filters.period}

    return Promise.all([
        fetchAutomationDatasetTimeSeries(filters, timezone, granularity),
        fetchAutomationDatasetTimeSeries(
            onlyPeriodFilter,
            timezone,
            granularity
        ),
        fetchBillableTicketDatasetTimeSeries(
            filters,
            timezone,
            granularity,
            aiAgentUserId
        ),
    ]).then(
        ([
            filteredAutomatedInteractionsData,
            allAutomatedInteractionsData,
            billableTicketData,
        ]) => {
            const filteredInteractionsByAutoRespondersSeries =
                getAutomateStatsByMeasure(
                    AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
                    filteredAutomatedInteractionsData
                )

            const allAutomatedInteractionsSeries = getAutomateStatsByMeasure(
                AutomationDatasetMeasure.AutomatedInteractions,
                allAutomatedInteractionsData
            )

            const allAutomatedInteractionsByAutoRespondersSeries =
                getAutomateStatsByMeasure(
                    AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
                    allAutomatedInteractionsData
                )

            const billableTicketCountsSeries = getAutomateStatsByMeasure(
                BillableTicketDatasetMeasure.BillableTicketCount,
                billableTicketData
            )
            const filteredAutomatedInteractionsSeries =
                getAutomateStatsByMeasure(
                    AutomationDatasetMeasure.AutomatedInteractions,
                    filteredAutomatedInteractionsData
                )

            const automationRates: TimeSeriesDataItem[] = []
            if (
                filteredAutomatedInteractionsSeries?.length &&
                billableTicketCountsSeries?.length
            ) {
                filteredAutomatedInteractionsSeries?.forEach(
                    (timeSeries, index) => {
                        const filteredAutomatedInteractions = timeSeries.value
                        const filteredAutomatedInteractionsByAutoResponders =
                            filteredInteractionsByAutoRespondersSeries?.[index]
                                .value
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
                            value: isAutomateNonFilteredDenominatorInAutomationRate
                                ? automationRateUnfilteredDenominator({
                                      filteredAutomatedInteractions,
                                      allAutomatedInteractions,
                                      allAutomatedInteractionsByAutoResponders,
                                      billableTicketsCount: billableTicketCount,
                                  })
                                : automationRate(
                                      filteredAutomatedInteractions,
                                      billableTicketCount,
                                      filteredAutomatedInteractionsByAutoResponders
                                  ),
                            label: AUTOMATION_RATE_LABEL,
                        })
                    }
                )
            }

            return {data: [automationRates], isFetching: false, isError: false}
        }
    )
}
