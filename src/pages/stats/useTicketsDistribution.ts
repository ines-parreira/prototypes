import {useMemo} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {useCustomFieldsTicketCount} from 'hooks/reporting/metricsPerDimension'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'
import {getSelectedCustomField} from 'state/ui/stats/ticketInsightsSlice'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'

export const useTicketsDistribution = (topAmount = 10) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const selectedCustomField = useAppSelector(getSelectedCustomField)

    const {data, isFetching} = useCustomFieldsTicketCount(
        cleanStatsFilters,
        userTimezone,
        String(selectedCustomField.id)
    )

    const topData = useMemo(
        () => data?.allData.slice(0, topAmount) || [],
        [data?.allData, topAmount]
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

    const topDataMaxValue = Math.max(
        ...topData.map((item) =>
            Number(
                item[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]
            )
        )
    )

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

    const maxTicketCount = Math.max(topDataMaxValue, outsideTopTotal)

    return useMemo(
        () => ({
            isFetching,
            topData: topData.map((item) => ({
                category:
                    item[
                        TicketCustomFieldsDimension
                            .TicketCustomFieldsValueString
                    ] || NOT_AVAILABLE_PLACEHOLDER,
                value: Number(
                    item[
                        TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
                    ]
                ),
                valueInPercentage:
                    (100 *
                        Number(
                            item[
                                TicketCustomFieldsMeasure
                                    .TicketCustomFieldsTicketCount
                            ]
                        )) /
                    maxTicketCount,
            })),
            ticketsCountTotal,
            outsideTopTotal,
            outsideTopTotalPercentage:
                outsideTopTotal > topDataMaxValue
                    ? 100
                    : (100 * outsideTopTotal) / ticketsCountTotal,
        }),
        [
            isFetching,
            outsideTopTotal,
            ticketsCountTotal,
            topData,
            topDataMaxValue,
            maxTicketCount,
        ]
    )
}
