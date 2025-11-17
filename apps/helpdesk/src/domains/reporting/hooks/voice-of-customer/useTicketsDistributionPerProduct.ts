import { useMemo } from 'react'

import _sortBy from 'lodash/sortBy'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useTicketsPerProductTrend } from 'domains/reporting/hooks/voice-of-customer/useTicketsPerProductTrend'
import {
    getSorting,
    PRODUCT_ID_FIELD,
    PRODUCT_NAME_FIELD,
    ProductsPerTicketColumn,
    TICKET_COUNT_FIELD,
} from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import type { ColumnSorting } from 'domains/reporting/state/ui/stats/types'
import { calculatePercentage } from 'domains/reporting/utils/reporting'
import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'

type ItemType = Record<string, string | null>

function getValuesUptoTopAmount(
    value: ItemType[],
    minAmount: number,
    topAmount: number,
) {
    return value.slice(minAmount, topAmount)
}

function getTotalCount(value: ItemType[]) {
    return value?.reduce((acc, cur) => acc + Number(cur[TICKET_COUNT_FIELD]), 0)
}

function getTicketCount(value?: ItemType) {
    return value && value[TICKET_COUNT_FIELD]
        ? Number(value[TICKET_COUNT_FIELD])
        : 0
}

const sortBy = <T extends ItemType>(
    currentTopData: T[],
    previousTopData: T[],
    sorting: ColumnSorting<ProductsPerTicketColumn>,
) => {
    let sortedData: T[] = []
    let unsortedData: T[] = []

    switch (sorting.field) {
        case ProductsPerTicketColumn.Product:
            sortedData = _sortBy(currentTopData, PRODUCT_NAME_FIELD)
            break

        case ProductsPerTicketColumn.TicketVolume:
            sortedData = _sortBy(currentTopData, (record) => {
                const value = record[TICKET_COUNT_FIELD]
                return value ? Number(value) : value
            })
            break

        case ProductsPerTicketColumn.Delta: {
            sortedData = _sortBy(currentTopData, (record) => {
                const prevValue = previousTopData.find(
                    (item) =>
                        item[PRODUCT_ID_FIELD] === record[PRODUCT_ID_FIELD],
                )?.[TICKET_COUNT_FIELD]

                return Number(record[TICKET_COUNT_FIELD]) - Number(prevValue)
            })
        }
    }

    if (sorting.direction === OrderDirection.Asc) {
        return [...sortedData, ...unsortedData]
    }
    return [...unsortedData, ...sortedData].reverse()
}

export const getProductName = (id: string | null, name: string | null) =>
    name ? name : `Product: ${String(id)}`

export const useTicketsPerProductDistribution = (topAmount = 10) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const sorting = useAppSelector(getSorting)

    const { data, isFetching } = useTicketsPerProductTrend(
        cleanStatsFilters,
        userTimezone,
        sorting.direction,
    )

    const currentTopData = getValuesUptoTopAmount(data.value, 0, topAmount)

    const topDataMaxValue = useMemo(
        () =>
            Math.max(
                ...currentTopData.map((item) =>
                    Number(item[TICKET_COUNT_FIELD]),
                ),
            ),
        [currentTopData],
    )

    const previousTopData = getValuesUptoTopAmount(data.prevValue, 0, topAmount)

    const ticketsCountTotal = getTotalCount(data.value)

    const outsideTopTotal = getTotalCount(
        getValuesUptoTopAmount(data.value, topAmount, data.value.length),
    )

    const sortedTopData = sortBy(currentTopData, previousTopData, sorting)

    const dataToRender = useMemo(() => {
        return sortedTopData.map((item) => {
            const previousItem = previousTopData.find(
                (ptd) => ptd[PRODUCT_ID_FIELD] === item[PRODUCT_ID_FIELD],
            )
            return {
                productId: String(item[PRODUCT_ID_FIELD]),
                value: getTicketCount(item),
                prevValue: getTicketCount(previousItem),
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
                name: getProductName(
                    item[PRODUCT_ID_FIELD],
                    item[PRODUCT_NAME_FIELD],
                ),
            }
        })
    }, [
        sortedTopData,
        previousTopData,
        topDataMaxValue,
        ticketsCountTotal,
        outsideTopTotal,
    ])

    if (!currentTopData.length) {
        return {
            data: [],
            isFetching,
        }
    }

    return {
        data: dataToRender,
        isFetching,
    }
}
