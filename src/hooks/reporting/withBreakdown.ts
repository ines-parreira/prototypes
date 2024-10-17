import _groupBy from 'lodash/groupBy'
import _orderBy from 'lodash/orderBy'
import _zip from 'lodash/zip'
import {
    TimeSeriesDataItem,
    TimeSeriesDataItemWithPercentageAndDecile,
} from 'hooks/reporting/useTimeSeries'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {UsePostReportingQueryData} from 'models/reporting/queries'
import {TicketInsightsOrder} from 'state/ui/stats/ticketInsightsSlice'
import {notUndefined} from 'utils/types'

export const TAG_SEPARATOR = '::'
export const BREAKDOWN_FIELD =
    TicketCustomFieldsDimension.TicketCustomFieldsValueString
export const VALUE_FIELD =
    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount

export const withBreakdown = <
    TData extends UsePostReportingQueryData<
        TicketCustomFieldsTicketCountData[]
    >,
>(
    res: TData,
    breakdownField: TicketCustomFieldsDimension.TicketCustomFieldsValueString,
    valueField: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
): UsePostReportingQueryData<
    WithChildren<TicketCustomFieldsTicketCountData>[]
> => {
    return {
        ...res,
        data: {
            ...res.data,
            data: selectWithBreakdown(
                res.data.data,
                breakdownField,
                valueField
            ),
        },
    }
}

export type TicketCustomFieldsTicketCountData = {
    [BREAKDOWN_FIELD]: string | null
    [VALUE_FIELD]: string | null
}

export type TicketCustomFieldsTicketCountTimeSeriesData = {
    [BREAKDOWN_FIELD]: string
    [VALUE_FIELD]?: number
    timeSeries: TimeSeriesDataItem[]
    initialCustomFieldValue: string[] | null
}

export type TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile =
    {
        [BREAKDOWN_FIELD]: string
        [VALUE_FIELD]?: number
        timeSeries: TimeSeriesDataItemWithPercentageAndDecile[]
        percentage: number
        decile: number
        totalsDecile: number
        initialCustomFieldValue: string[] | null
    }

type WithChildren<T> = T & {children: WithChildren<T>[]}

export const selectWithBreakdown = (
    data: TicketCustomFieldsTicketCountData[],
    breakdownField: TicketCustomFieldsDimension.TicketCustomFieldsValueString,
    valueField: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
): WithChildren<TicketCustomFieldsTicketCountData>[] => {
    const hierarchy = data.map((element) => {
        const tags = String(element[breakdownField]).split(TAG_SEPARATOR)

        return tags.reduceRight<
            WithChildren<TicketCustomFieldsTicketCountData>
        >(
            (accumulator, currentValue, currentIndex) => {
                if (currentIndex === tags.length - 1) return accumulator
                return {
                    [breakdownField]: currentValue,
                    [valueField]: accumulator[valueField],
                    children: [accumulator],
                }
            },
            {
                [breakdownField]: tags[tags.length - 1],
                [valueField]: element[valueField],
                children: [],
            }
        )
    })

    return compact(hierarchy, mergeValues, breakdownField, valueField)
}

const orderIteratee = (
    column: TicketInsightsOrder['column'],
    breakdownField: TicketCustomFieldsDimension.TicketCustomFieldsValueString,
    valueField: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
) => {
    switch (column) {
        case 'total':
            return [valueField]
        case 'label':
            return [breakdownField]
        default:
            return (i: TicketCustomFieldsTicketCountTimeSeriesData) =>
                i.timeSeries[column]?.value
    }
}

export const selectTimeSeriesWithBreakdown = (
    data: TicketCustomFieldsTicketCountTimeSeriesData[],
    order: TicketInsightsOrder,
    breakdownField: TicketCustomFieldsDimension.TicketCustomFieldsValueString,
    valueField: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
): WithChildren<TicketCustomFieldsTicketCountTimeSeriesData>[] => {
    const hierarchy = data.map((element) => {
        const tags = String(element[breakdownField]).split(TAG_SEPARATOR)

        return tags.reduceRight<
            WithChildren<TicketCustomFieldsTicketCountTimeSeriesData>
        >(
            (accumulator, currentValue, currentIndex) => {
                if (currentIndex === tags.length - 1) return accumulator
                return {
                    [breakdownField]: currentValue,
                    [valueField]: accumulator[valueField],
                    timeSeries: accumulator.timeSeries,
                    initialCustomFieldValue: [element[breakdownField]],
                    children: [accumulator],
                }
            },
            {
                [breakdownField]: tags[tags.length - 1],
                [valueField]: element.timeSeries.reduce(
                    (sum, cur) => sum + cur.value,
                    0
                ),
                initialCustomFieldValue: [element[breakdownField]],
                timeSeries: element.timeSeries,
                children: [],
            }
        )
    })

    return _orderBy(
        compact(hierarchy, mergeTimeSeries(order), breakdownField, valueField),
        orderIteratee(order.column, breakdownField, valueField),
        order.direction
    )
}

const compact = <
    Data extends
        | TicketCustomFieldsTicketCountData
        | TicketCustomFieldsTicketCountTimeSeriesData,
>(
    data: WithChildren<Data>[],
    merge: (
        data: WithChildren<Data>[],
        breakdownField: TicketCustomFieldsDimension.TicketCustomFieldsValueString,
        valueField: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
    ) => WithChildren<Data>,
    breakdownField: TicketCustomFieldsDimension.TicketCustomFieldsValueString,
    valueField: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
) => {
    const grouped = _groupBy(data, (el) => el[breakdownField])

    return Object.values(grouped).map((item) =>
        merge(item, breakdownField, valueField)
    )
}

const mergeValues = (
    data: WithChildren<TicketCustomFieldsTicketCountData>[],
    breakdownField: TicketCustomFieldsDimension.TicketCustomFieldsValueString,
    valueField: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
): WithChildren<TicketCustomFieldsTicketCountData> =>
    data.reduce((acc, currVal) => ({
        [breakdownField]: acc[breakdownField],
        [valueField]: String(
            Number(acc[valueField]) + Number(currVal[valueField])
        ),
        children: compact(
            [...acc.children, ...currVal.children],
            mergeValues,
            breakdownField,
            valueField
        ),
    }))

const mergeTimeSeries =
    (order: TicketInsightsOrder) =>
    (
        data: WithChildren<TicketCustomFieldsTicketCountTimeSeriesData>[],
        breakdownField: TicketCustomFieldsDimension.TicketCustomFieldsValueString,
        valueField: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
    ): WithChildren<TicketCustomFieldsTicketCountTimeSeriesData> =>
        data.reduce((acc, currVal) => {
            const zipped: (TimeSeriesDataItem | undefined)[][] = _zip(
                acc.timeSeries,
                currVal.timeSeries
            )

            const summed: TimeSeriesDataItem[] = zipped.map((values) =>
                values.filter(notUndefined).reduce<TimeSeriesDataItem>(
                    (acc, currVal) => {
                        return {
                            ...acc,
                            ...currVal,
                            dateTime: currVal.dateTime,
                            value: acc.value + currVal.value,
                        }
                    },
                    {
                        label: '',
                        dateTime: '',
                        value: 0,
                    }
                )
            )

            return {
                [breakdownField]: acc[breakdownField],
                [valueField]: summed.reduce((sum, cur) => sum + cur.value, 0),
                initialCustomFieldValue: acc.initialCustomFieldValue
                    ? [
                          ...acc.initialCustomFieldValue,
                          ...(currVal.initialCustomFieldValue || []),
                      ]
                    : null,
                timeSeries: summed,
                children: _orderBy(
                    compact(
                        [...acc.children, ...currVal.children],
                        mergeTimeSeries(order),
                        breakdownField,
                        valueField
                    ),
                    orderIteratee(order.column, breakdownField, valueField),
                    order.direction
                ),
            }
        })
