import {useFlags} from 'launchdarkly-react-client-sdk'
import _difference from 'lodash/difference'
import _orderBy from 'lodash/orderBy'
import {useMemo} from 'react'
import {renameMemberEnriched} from 'hooks/reporting/useEnrichedCubes'
import {FeatureFlagKey} from 'config/featureFlags'

import {
    useClosedTicketsMetricPerAgent,
    useOneTouchTicketsMetricPerAgent,
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
    const isAnalyticsNewCubes: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewCubes]
    const assigneeIdField = isAnalyticsNewCubes
        ? renameMemberEnriched(TicketDimension.AssigneeUserId)
        : TicketDimension.AssigneeUserId
    const ticketCountField = isAnalyticsNewCubes
        ? renameMemberEnriched(TicketMeasure.TicketCount)
        : TicketMeasure.TicketCount

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
                            value[assigneeIdField] === item[assigneeIdField]
                    )?.[ticketCountField]

                return {
                    ...item,
                    [ticketCountField]: closedTicketsValue
                        ? String(
                              calculatePercentage(
                                  Number(item[ticketCountField]),
                                  Number(closedTicketsValue)
                              )
                          )
                        : null,
                }
            }),
        [
            assigneeIdField,
            closedTicketsPerAgent.data?.allData,
            data?.allData,
            ticketCountField,
        ]
    )

    const sortAllData = () => {
        const nonNullValues =
            allData?.filter((item) => item[ticketCountField] !== null) || []

        const sortedArray = _orderBy(
            nonNullValues,
            (v) => Number(v[ticketCountField]),
            sorting
        )

        return sortedArray.concat(_difference(allData, nonNullValues))
    }

    const sortedData = sortAllData()

    const maxValue = sortedData.length
        ? Math.max(...sortedData.map((item) => Number(item[ticketCountField])))
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
