import { flatMap } from 'lodash'

import { calculateMetricPerHour } from 'hooks/reporting/metricCalculations'
import {
    QueryReturnType,
    ReportingMetricItem,
} from 'hooks/reporting/useMetricPerDimension'
import {
    AgentTimeTrackingCube,
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketTagsEnrichedCube,
    TicketTagsEnrichedDimension,
} from 'models/reporting/cubes/TicketTagsEnrichedCube'
import { StatsFilters } from 'models/stat/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'

export const calculateTotalCapacity = (
    allAgentsMetricData:
        | ReportingMetricItem<HelpdeskMessageCubeWithJoins>[]
        | undefined,
    onlineTimeDataPerAllAgents:
        | ReportingMetricItem<AgentTimeTrackingCube>[]
        | undefined,
    agentIdDimension: string,
    measure: string,
) => {
    const onlineTimeMeasure = AgentTimeTrackingMeasure.OnlineTime
    const onlineTimeAgentID = AgentTimeTrackingDimension.UserId

    if (
        allAgentsMetricData === undefined ||
        onlineTimeDataPerAllAgents === undefined
    ) {
        return {
            value: null,
        }
    }

    const totalMetricsPerAgentsPerHour = onlineTimeDataPerAllAgents.reduce(
        (total, onlineTime) => {
            const onlineTimePerAgent = onlineTime[onlineTimeMeasure]
            const agentId = onlineTime[onlineTimeAgentID]
            const metricDataPerAgentRow = allAgentsMetricData.find(
                (item) => item[agentIdDimension] === agentId,
            )
            const metricDataPerAgent = metricDataPerAgentRow?.[measure] || 0

            return (
                total +
                calculateMetricPerHour(
                    Number(metricDataPerAgent),
                    Number(onlineTimePerAgent),
                )
            )
        },
        0,
    )

    return { value: totalMetricsPerAgentsPerHour }
}

export const filterTicketsByTagId = (
    data: QueryReturnType<TicketTagsEnrichedCube>,
    tags: number[],
) =>
    data?.reduce<QueryReturnType<TicketTagsEnrichedCube>>((acc, item) => {
        const isMatchingTag = tags.find(
            (tagId) =>
                tagId.toString() === item[TicketTagsEnrichedDimension.TagId],
        )
        if (isMatchingTag) acc.push(item)
        return acc
    }, [])

export const getTagValuesByOperator = (statsFilters: StatsFilters) =>
    flatMap(
        statsFilters.tags?.map((tag) =>
            tag.operator === LogicalOperatorEnum.ALL_OF ||
            tag.operator === LogicalOperatorEnum.ONE_OF
                ? tag.values
                : [],
        ),
    )
