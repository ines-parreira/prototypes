import { useMemo } from 'react'

import { stripEscapedQuotes } from 'domains/reporting/hooks/common/utils'
import { useCustomFieldsTicketCount } from 'domains/reporting/hooks/metricsPerCustomField'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    Entity,
    useTicketTimeReference,
} from 'domains/reporting/hooks/ticket-insights/useTicketTimeReference'
import {
    BREAKDOWN_FIELD,
    VALUE_FIELD,
} from 'domains/reporting/hooks/withBreakdown'
import { NOT_AVAILABLE_PLACEHOLDER } from 'domains/reporting/pages/common/utils'
import { calculatePercentage } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const useTicketsDistribution = (
    selectedCustomFieldId: number,
    topAmount = 10,
) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const [ticketFieldsTicketTimeReference] = useTicketTimeReference(
        Entity.TicketField,
    )

    const { data, isFetching } = useCustomFieldsTicketCount(
        cleanStatsFilters,
        userTimezone,
        selectedCustomFieldId,
        OrderDirection.Desc,
        ticketFieldsTicketTimeReference,
    )
    const ticketCountField =
        data?.measures?.find(
            (item) => item === VALUE_FIELD || item === 'ticketCount',
        ) || VALUE_FIELD
    const customFieldDimension =
        data?.dimensions?.find(
            (item) => item === BREAKDOWN_FIELD || item === 'customFieldValue',
        ) || BREAKDOWN_FIELD

    const topData = useMemo(
        () =>
            data?.allData.slice(0, topAmount).map((item) => ({
                ...item,
                [customFieldDimension]: stripEscapedQuotes(
                    item[customFieldDimension] == null
                        ? null
                        : String(item[customFieldDimension]),
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
                    item[customFieldDimension]?.toString() ||
                    NOT_AVAILABLE_PLACEHOLDER,
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
