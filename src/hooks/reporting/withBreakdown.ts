import _groupBy from 'lodash/groupBy'
import _orderBy from 'lodash/orderBy'
import _zip from 'lodash/zip'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {OrderDirection} from 'models/api/types'
import {
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {UsePostReportingQueryData} from 'models/reporting/queries'
import {notUndefined} from 'utils/types'

export const TAG_SEPARATOR = '::'
export const BREAKDOWN_FIELD =
    TicketCustomFieldsMember.TicketCustomFieldsValueString
export const VALUE_FIELD =
    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount

export const withBreakdown = <
    TData extends UsePostReportingQueryData<TicketCustomFieldsTicketCountData[]>
>(
    res: TData
): UsePostReportingQueryData<
    WithChildren<TicketCustomFieldsTicketCountData>[]
> => {
    return {
        ...res,
        data: {
            ...res.data,
            data: selectWithBreakdown(res.data.data),
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
}

type WithChildren<T> = T & {children: WithChildren<T>[]}

export const selectWithBreakdown = (
    data: TicketCustomFieldsTicketCountData[]
): WithChildren<TicketCustomFieldsTicketCountData>[] => {
    const hierarchy = data.map((element) => {
        const tags = String(element[BREAKDOWN_FIELD]).split(TAG_SEPARATOR)

        return tags.reduceRight<
            WithChildren<TicketCustomFieldsTicketCountData>
        >(
            (accumulator, currentValue, currentIndex) => {
                if (currentIndex === tags.length - 1) return accumulator
                return {
                    [BREAKDOWN_FIELD]: currentValue,
                    [VALUE_FIELD]: accumulator[VALUE_FIELD],
                    children: [accumulator],
                }
            },
            {
                [BREAKDOWN_FIELD]: tags[tags.length - 1],
                [VALUE_FIELD]: element[VALUE_FIELD],
                children: [],
            }
        )
    })

    return compact(hierarchy, mergeValues)
}

export const selectTimeSeriesWithBreakdown = (
    data: TicketCustomFieldsTicketCountTimeSeriesData[],
    order: OrderDirection
): WithChildren<TicketCustomFieldsTicketCountTimeSeriesData>[] => {
    const hierarchy = data.map((element) => {
        const tags = String(element[BREAKDOWN_FIELD]).split(TAG_SEPARATOR)

        return tags.reduceRight<
            WithChildren<TicketCustomFieldsTicketCountTimeSeriesData>
        >(
            (accumulator, currentValue, currentIndex) => {
                if (currentIndex === tags.length - 1) return accumulator
                return {
                    [BREAKDOWN_FIELD]: currentValue,
                    [VALUE_FIELD]: accumulator[VALUE_FIELD],
                    timeSeries: accumulator.timeSeries,
                    children: [accumulator],
                }
            },
            {
                [BREAKDOWN_FIELD]: tags[tags.length - 1],
                [VALUE_FIELD]: element.timeSeries.reduce(
                    (sum, cur) => sum + cur.value,
                    0
                ),
                timeSeries: element.timeSeries,
                children: [],
            }
        )
    })

    return _orderBy(
        compact(hierarchy, mergeTimeSeries(order)),
        [BREAKDOWN_FIELD],
        order
    )
}

const compact = <
    Data extends
        | TicketCustomFieldsTicketCountData
        | TicketCustomFieldsTicketCountTimeSeriesData
>(
    data: WithChildren<Data>[],
    merge: (data: WithChildren<Data>[]) => WithChildren<Data>
) => {
    const grouped = _groupBy(data, (el) => el[BREAKDOWN_FIELD])

    return Object.values(grouped).map(merge)
}

const mergeValues = (
    data: WithChildren<TicketCustomFieldsTicketCountData>[]
): WithChildren<TicketCustomFieldsTicketCountData> =>
    data.reduce((acc, currVal) => ({
        [BREAKDOWN_FIELD]: acc[BREAKDOWN_FIELD],
        [VALUE_FIELD]: String(
            Number(acc[VALUE_FIELD]) + Number(currVal[VALUE_FIELD])
        ),
        children: compact([...acc.children, ...currVal.children], mergeValues),
    }))

const mergeTimeSeries =
    (order: OrderDirection) =>
    (
        data: WithChildren<TicketCustomFieldsTicketCountTimeSeriesData>[]
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
                [BREAKDOWN_FIELD]: acc[BREAKDOWN_FIELD],
                [VALUE_FIELD]: summed.reduce((sum, cur) => sum + cur.value, 0),
                timeSeries: summed,
                children: _orderBy(
                    compact(
                        [...acc.children, ...currVal.children],
                        mergeTimeSeries(order)
                    ),
                    [BREAKDOWN_FIELD],
                    order
                ),
            }
        })
