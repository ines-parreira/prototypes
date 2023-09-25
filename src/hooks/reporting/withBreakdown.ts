import _groupBy from 'lodash/groupBy'
import {DataResponse} from 'hooks/reporting/withDeciles'
import {
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'

export const TAG_SEPARATOR = '::'
export const BREAKDOWN_FIELD =
    TicketCustomFieldsMember.TicketCustomFieldsValueString
export const VALUE_FIELD =
    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount

export const withBreakdown = <
    TData extends DataResponse<TicketCustomFieldsTicketCountData>
>(
    res: TData
) => {
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
    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: string | null
}

type WithChildren<T> = T & {children: WithChildren<T>[]}

export const selectWithBreakdown = (
    data: TicketCustomFieldsTicketCountData[]
) => {
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

    return compact(hierarchy)
}

const compact = (data: WithChildren<TicketCustomFieldsTicketCountData>[]) => {
    const grouped = _groupBy(data, (el) => el[BREAKDOWN_FIELD])

    return Object.values(grouped).map(merge)
}

const merge = (
    data: WithChildren<TicketCustomFieldsTicketCountData>[]
): WithChildren<TicketCustomFieldsTicketCountData> =>
    data.reduce((acc, currVal) => ({
        [BREAKDOWN_FIELD]: acc[BREAKDOWN_FIELD],
        [VALUE_FIELD]: String(
            Number(acc[VALUE_FIELD]) + Number(currVal[VALUE_FIELD])
        ),
        children: compact([...acc.children, ...currVal.children]),
    }))
