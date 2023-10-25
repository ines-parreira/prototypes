import {useMemo} from 'react'
import _orderBy from 'lodash/orderBy'
import _difference from 'lodash/difference'

import {
    useOneTouchTicketsMetricPerAgent,
    useClosedTicketsMetricPerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {OrderDirection} from 'models/api/types'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {StatsFilters} from 'models/stat/types'
import {calculateDecile} from './useCustomFieldsTicketCountPerCustomFields'

const calculatePercentage = (x: number, y: number) => (x / y) * 100

export const useOneTouchTicketsPercentageMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) => {
    const {data, isFetching, isError} = useOneTouchTicketsMetricPerAgent(
        statsFilters,
        timezone,
        sorting,
        agentAssigneeId
    )

    const closedTicketsPerAgent = useClosedTicketsMetricPerAgent(
        statsFilters,
        timezone,
        sorting,
        agentAssigneeId
    )

    let metricValue: number | null = null

    if (closedTicketsPerAgent.data?.value && data?.value) {
        metricValue = calculatePercentage(
            data.value,
            closedTicketsPerAgent.data.value
        )
    }

    const allData = useMemo(
        () =>
            data?.allData.map((item) => {
                const closedTicketsValue =
                    closedTicketsPerAgent.data?.allData.find(
                        (value) =>
                            value[TicketDimension.AssigneeUserId] ===
                            item[TicketDimension.AssigneeUserId]
                    )?.[TicketMeasure.TicketCount]

                return {
                    ...item,
                    [TicketMeasure.TicketCount]: closedTicketsValue
                        ? String(
                              calculatePercentage(
                                  Number(item[TicketMeasure.TicketCount]),
                                  Number(closedTicketsValue)
                              )
                          )
                        : null,
                }
            }),
        [closedTicketsPerAgent.data?.allData, data?.allData]
    )

    const sortAllData = () => {
        const nonNullValues =
            allData?.filter(
                (item) => item[TicketMeasure.TicketCount] !== null
            ) || []

        const sortedArray = _orderBy(
            nonNullValues,
            (v) => Number(v[TicketMeasure.TicketCount]),
            sorting
        )

        return sortedArray.concat(_difference(allData, nonNullValues))
    }

    const sortedData = sortAllData()

    const maxValue = sortedData.length
        ? Math.max(
              ...sortedData.map((item) =>
                  Number(item[TicketMeasure.TicketCount])
              )
          )
        : 0

    return {
        isFetching: isFetching || closedTicketsPerAgent.isFetching,
        isError: isError || closedTicketsPerAgent.isError,
        data: {
            allData: sortedData,
            value: metricValue,
            decile: calculateDecile(metricValue || 0, maxValue),
        },
    }
}
