import { useMemo } from 'react'

import { useTagsTicketCount } from 'domains/reporting/hooks/metricsPerPeriod'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { ReportingMetricItemValue } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    TicketTagsEnrichedDimension,
    TicketTagsEnrichedMeasure,
} from 'domains/reporting/models/cubes/TicketTagsEnrichedCube'
import { getTagName } from 'domains/reporting/pages/ticket-insights/tags/helpers'
import { calculatePercentage } from 'domains/reporting/utils/reporting'
import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'
import { getEntitiesTags } from 'state/entities/tags/selectors'

const ticketCountField = TicketTagsEnrichedMeasure.TicketCount
const tagsDimension = TicketTagsEnrichedDimension.TagId

type ItemType = {
    [key: string]: ReportingMetricItemValue
}

function getValuesUptoTopAmount(
    value: Array<ItemType>,
    minAmount: number,
    topAmount: number,
) {
    return value.slice(minAmount, topAmount)
}

function getTotalCount(value: Array<ItemType>) {
    return value?.reduce((acc, cur) => acc + Number(cur[ticketCountField]), 0)
}

function getTicketCount(value?: ItemType) {
    return value && value[ticketCountField]
        ? Number(value[ticketCountField])
        : 0
}

export const useTagsDistribution = (topAmount = 10) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const tags = useAppSelector(getEntitiesTags)

    const { data, isFetching } = useTagsTicketCount(
        cleanStatsFilters,
        userTimezone,
        OrderDirection.Desc,
    )

    const currentTopData = getValuesUptoTopAmount(data.value, 0, topAmount)

    const topDataMaxValue = useMemo(
        () =>
            Math.max(
                ...currentTopData.map((item) => Number(item[ticketCountField])),
            ),
        [currentTopData],
    )

    if (!currentTopData.length) {
        return {
            isFetching,
            data: [],
        }
    }

    const previousTopData = getValuesUptoTopAmount(data.prevValue, 0, topAmount)

    const ticketsCountTotal = getTotalCount(data.value)

    const outsideTopTotal = getTotalCount(
        getValuesUptoTopAmount(data.value, topAmount, data.value.length),
    )

    return {
        isFetching,
        data: currentTopData.map((item) => {
            const previousItem = previousTopData.find(
                (ptd) => ptd[tagsDimension] === item[tagsDimension],
            )
            const tagKey = item[tagsDimension] || ''
            return {
                category: item[tagsDimension],
                value: getTicketCount(item),
                valueInPercentage: calculatePercentage(
                    getTicketCount(item),
                    ticketsCountTotal,
                ),
                previousValueInPercentage: calculatePercentage(
                    getTicketCount(previousItem),
                    ticketsCountTotal,
                ),
                gaugePercentage: calculatePercentage(
                    getTicketCount(item),
                    Math.max(topDataMaxValue, outsideTopTotal),
                ),
                name: getTagName({ name: tags[tagKey]?.name, id: tagKey }),
            }
        }),
    }
}
