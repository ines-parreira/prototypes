import { flatMap } from 'lodash'

import { calculateMetricPerHour } from 'hooks/reporting/metricCalculations'
import {
    fetchMetricPerDimension,
    MetricWithDecileFetch,
    QueryReturnType,
    ReportingMetricItem,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import { Cubes } from 'models/reporting/cubes'
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
import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'models/reporting/queryFactories/utils'
import { ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { NOT_AVAILABLE_PLACEHOLDER } from 'pages/stats/common/utils'
import { TICKET_CUSTOM_FIELDS_NEW_SEPARATOR } from 'pages/stats/utils'

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
type QueryFactory<TCube extends Cubes> = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
) => ReportingQuery<TCube>

export const createFetchPerDimension =
    <TCube extends Cubes>(query: QueryFactory<TCube>): MetricWithDecileFetch =>
    (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        dimensionId?: string,
    ) =>
        fetchMetricPerDimension(
            query(statsFilters, timezone, sorting),
            dimensionId,
        )

export const createMetricPerDimensionHook =
    <TCube extends Cubes>(query: QueryFactory<TCube>) =>
    (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        dimensionId?: string,
    ) =>
        useMetricPerDimension(
            query(statsFilters, timezone, sorting),
            dimensionId,
        )

export const transformCategorySeparator = (category?: string | null): string =>
    category
        ?.split(TICKET_CUSTOM_FIELDS_API_SEPARATOR)
        .join(TICKET_CUSTOM_FIELDS_NEW_SEPARATOR) || NOT_AVAILABLE_PLACEHOLDER

export const transformCategoriesSeparator = (allData?: (string | null)[]) =>
    allData?.map(transformCategorySeparator) || []
