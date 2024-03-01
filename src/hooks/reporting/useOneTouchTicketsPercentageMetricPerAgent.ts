import {useFlags} from 'launchdarkly-react-client-sdk'
import _difference from 'lodash/difference'
import _orderBy from 'lodash/orderBy'
import {useMemo} from 'react'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    MetricWithDecile,
    QueryReturnType,
} from 'hooks/reporting/useMetricPerDimension'
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

export const calculatePercentage = (x: number, y: number) => (x / y) * 100

export const matchAndCalculateAllEntries = (
    data: MetricWithDecile,
    dataB: MetricWithDecile,
    calculatePercentage: (a: number, b: number) => number,
    dataAssigneeIdField: string,
    dataBAssigneeIdField: string,
    dataMeasureField: string,
    dataBMeasureField: string
): QueryReturnType<HelpdeskMessageCubeWithJoins> =>
    data.data?.allData.map((item) => {
        const matchingValue = dataB.data?.allData.find(
            (value) => value[dataBAssigneeIdField] === item[dataAssigneeIdField]
        )?.[dataBMeasureField]

        return {
            ...item,
            [dataMeasureField]: matchingValue
                ? String(
                      calculatePercentage(
                          Number(item[dataMeasureField]),
                          Number(matchingValue)
                      )
                  )
                : null,
        }
    }) ?? []

export const sortAllData = (
    allData: QueryReturnType<HelpdeskMessageCubeWithJoins>,
    ticketCountField: string,
    sorting?: OrderDirection
) => {
    const nonNullValues = allData.filter(
        (item) => item[ticketCountField] !== null
    )

    const sortedArray = _orderBy(
        nonNullValues,
        (v) => Number(v[ticketCountField]),
        sorting
    )

    return sortedArray.concat(_difference(allData, nonNullValues))
}

export const useOneTouchTicketsPercentageMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): MetricWithDecile => {
    const isAnalyticsNewCubes: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewCubes]
    const assigneeIdField = isAnalyticsNewCubes
        ? renameMemberEnriched(TicketDimension.AssigneeUserId)
        : TicketDimension.AssigneeUserId
    const ticketCountField = isAnalyticsNewCubes
        ? renameMemberEnriched(TicketMeasure.TicketCount)
        : TicketMeasure.TicketCount

    const oneTouchTickets = useOneTouchTicketsMetricPerAgent(
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

    if (closedTicketsPerAgent.data?.value && oneTouchTickets.data?.value) {
        metricValue = calculatePercentage(
            oneTouchTickets.data.value,
            closedTicketsPerAgent.data.value
        )
    }

    const sortedData = useMemo(() => {
        const allData = matchAndCalculateAllEntries(
            oneTouchTickets,
            closedTicketsPerAgent,
            calculatePercentage,
            assigneeIdField,
            assigneeIdField,
            ticketCountField,
            ticketCountField
        )
        return sortAllData(allData, ticketCountField, sorting)
    }, [
        assigneeIdField,
        closedTicketsPerAgent,
        oneTouchTickets,
        sorting,
        ticketCountField,
    ])

    const maxValue = Math.max(
        ...sortedData.map((item) => Number(item[ticketCountField]))
    )

    return {
        isFetching:
            oneTouchTickets.isFetching || closedTicketsPerAgent.isFetching,
        isError: oneTouchTickets.isError || closedTicketsPerAgent.isError,
        data: {
            allData: sortedData,
            value: metricValue,
            decile: calculateDecile(metricValue || 0, maxValue),
        },
    }
}
