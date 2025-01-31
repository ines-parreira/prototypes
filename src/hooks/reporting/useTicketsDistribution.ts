import {useMemo} from 'react'

import {useCustomFieldsTicketCount} from 'hooks/reporting/metricsPerCustomField'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import useAppSelector from 'hooks/useAppSelector'

import {OrderDirection} from 'models/api/types'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'
import {getSelectedCustomField} from 'state/ui/stats/ticketInsightsSlice'

export const useTicketsDistribution = (topAmount = 10) => {
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()
    const selectedCustomField = useAppSelector(getSelectedCustomField)

    const ticketCountField =
        TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
    const customFieldDimension =
        TicketCustomFieldsDimension.TicketCustomFieldsValueString

    const {data, isFetching} = useCustomFieldsTicketCount(
        cleanStatsFilters,
        userTimezone,
        String(selectedCustomField.id),
        OrderDirection.Desc
    )

    const topData = useMemo(
        () => data?.allData.slice(0, topAmount) || [],
        [data?.allData, topAmount]
    )
    const ticketsCountTotal =
        data?.allData.reduce(
            (acc, cur) => acc + Number(cur[ticketCountField]),
            0
        ) || 0

    const topDataMaxValue = Math.max(
        ...topData.map((item) => Number(item[ticketCountField]))
    )

    const outsideTopTotal =
        data?.allData
            .slice(topAmount, data?.allData.length)
            .reduce((acc, cur) => acc + Number(cur[ticketCountField]), 0) || 0

    const maxTicketCount = Math.max(topDataMaxValue, outsideTopTotal)

    return useMemo(
        () => ({
            isFetching,
            topData: topData.map((item) => ({
                category:
                    item[customFieldDimension] || NOT_AVAILABLE_PLACEHOLDER,
                value: Number(item[ticketCountField]),
                valueInPercentage:
                    (100 * Number(item[ticketCountField])) / ticketsCountTotal,
                gaugePercentage:
                    (100 * Number(item[ticketCountField])) / maxTicketCount,
            })),
            ticketsCountTotal,
            outsideTopTotal,
            outsideTopTotalPercentage:
                (100 * outsideTopTotal) / ticketsCountTotal,
            outsideTopTotalGaugePercentage:
                outsideTopTotal > topDataMaxValue
                    ? 100
                    : (100 * outsideTopTotal) / ticketsCountTotal,
        }),
        [
            isFetching,
            topData,
            ticketsCountTotal,
            outsideTopTotal,
            topDataMaxValue,
            customFieldDimension,
            ticketCountField,
            maxTicketCount,
        ]
    )
}
