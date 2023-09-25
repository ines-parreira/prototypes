import useAppSelector from 'hooks/useAppSelector'
import {useCustomFieldsTicketCount} from 'hooks/reporting/metricsPerDimension'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'
import {getSelectedCustomFieldId} from 'state/ui/stats/ticketInsightsSlice'
import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'

export const useTicketsDistribution = (topAmount = 10) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const selectedCustomFieldId = useAppSelector(getSelectedCustomFieldId)

    const {data, isFetching} = useCustomFieldsTicketCount(
        cleanStatsFilters,
        userTimezone,
        String(selectedCustomFieldId)
    )

    const ticketsCountTotal =
        data?.allData.reduce(
            (acc, cur) =>
                acc +
                Number(
                    cur[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]
                ),
            0
        ) || 0

    const outsideTopTotal =
        data?.allData
            .slice(topAmount, data?.allData.length)
            .reduce(
                (acc, cur) =>
                    acc +
                    Number(
                        cur[
                            TicketCustomFieldsMeasure
                                .TicketCustomFieldsTicketCount
                        ]
                    ),
                0
            ) || 0

    return {
        isFetching,
        topData: data?.allData.slice(0, topAmount) || [],
        ticketsCountTotal,
        outsideTopTotal,
        outsideTopTotalPercentage: (100 * outsideTopTotal) / ticketsCountTotal,
    }
}
