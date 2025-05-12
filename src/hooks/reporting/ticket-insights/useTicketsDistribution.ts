import { useMemo } from 'react'

import { stripEscapedQuotes } from 'hooks/reporting/common/utils'
import { useCustomFieldsTicketCount } from 'hooks/reporting/metricsPerCustomField'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import {
    Entity,
    useTicketTimeReference,
} from 'hooks/reporting/ticket-insights/useTicketTimeReference'
import { QueryReturnType } from 'hooks/reporting/useMetricPerDimension'
import { BREAKDOWN_FIELD, VALUE_FIELD } from 'hooks/reporting/withBreakdown'
import { OrderDirection } from 'models/api/types'
import { Cubes } from 'models/reporting/cubes'
import { NOT_AVAILABLE_PLACEHOLDER } from 'pages/stats/common/utils'
import { calculatePercentage } from 'utils/reporting'

export const useTicketsDistribution = (
    selectedCustomFieldId: number,
    topAmount = 10,
) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const ticketCountField = VALUE_FIELD
    const customFieldDimension = BREAKDOWN_FIELD

    const [ticketFieldsTicketTimeReference] = useTicketTimeReference(
        Entity.TicketField,
    )

    const { data, isFetching } = useCustomFieldsTicketCount(
        cleanStatsFilters,
        userTimezone,
        String(selectedCustomFieldId),
        OrderDirection.Desc,
        ticketFieldsTicketTimeReference,
    )

    const topData: QueryReturnType<Cubes> = useMemo(
        () =>
            data?.allData.slice(0, topAmount).map((item) => ({
                ...item,
                [customFieldDimension]: stripEscapedQuotes(
                    item[customFieldDimension],
                ),
            })) || [],
        [customFieldDimension, data?.allData, topAmount],
    )
    const ticketsCountTotal =
        data?.allData.reduce(
            (acc, cur) => acc + Number(cur[ticketCountField]),
            0,
        ) || 0

    const topDataMaxValue = Math.max(
        ...topData.map((item) => Number(item[ticketCountField])),
    )

    const outsideTopTotal =
        data?.allData
            .slice(topAmount, data?.allData.length)
            .reduce((acc, cur) => acc + Number(cur[ticketCountField]), 0) || 0

    const maxTicketCount = Math.max(topDataMaxValue, outsideTopTotal)

    return useMemo(() => {
        return {
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
            outsideTopTotalPercentage: calculatePercentage(
                outsideTopTotal,
                ticketsCountTotal,
            ),
            outsideTopTotalGaugePercentage:
                outsideTopTotal > topDataMaxValue
                    ? 100
                    : calculatePercentage(outsideTopTotal, ticketsCountTotal),
        }
    }, [
        isFetching,
        topData,
        ticketsCountTotal,
        outsideTopTotal,
        topDataMaxValue,
        customFieldDimension,
        ticketCountField,
        maxTicketCount,
    ])
}
