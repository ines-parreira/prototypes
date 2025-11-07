import { flatMap } from 'lodash'

import { calculateMetricPerHour } from 'domains/reporting/hooks/metricCalculations'
import { MetricName } from 'domains/reporting/hooks/metricNames'
import {
    fetchMetricPerDimensionV2,
    MetricWithDecileFetch,
    QueryReturnType,
    ReportingMetricItem,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { Cubes } from 'domains/reporting/models/cubes'
import {
    AgentTimeTrackingCube,
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketTagsEnrichedCube,
    TicketTagsEnrichedDimension,
} from 'domains/reporting/models/cubes/TicketTagsEnrichedCube'
import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'domains/reporting/models/queryFactories/utils'
import {
    MetricQueryFactory,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { NOT_AVAILABLE_PLACEHOLDER } from 'domains/reporting/pages/common/utils'
import { TICKET_CUSTOM_FIELDS_NEW_SEPARATOR } from 'domains/reporting/pages/utils'
import { OrderDirection } from 'models/api/types'

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
    <
        TCube extends Cubes,
        TMeta extends ScopeMeta,
        TMetricName extends MetricName,
    >(
        query: QueryFactory<TCube>,
        queryV2?: MetricQueryFactory<TMeta, TMetricName>,
    ): MetricWithDecileFetch =>
    (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        dimensionId?: string,
    ) =>
        fetchMetricPerDimensionV2(
            query(statsFilters, timezone, sorting),
            queryV2?.({
                filters: statsFilters,
                timezone,
                sortDirection: sorting,
            }),
            dimensionId,
        )

export const createMetricPerDimensionHook =
    <
        TCube extends Cubes,
        TMeta extends ScopeMeta,
        TMetricName extends MetricName,
    >(
        query: QueryFactory<TCube>,
        queryV2?: MetricQueryFactory<TMeta, TMetricName>,
    ) =>
    (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        dimensionId?: string,
    ) =>
        useMetricPerDimensionV2(
            query(statsFilters, timezone, sorting),
            queryV2?.({
                filters: statsFilters,
                timezone,
                sortDirection: sorting,
            }),
            dimensionId,
        )

export const transformCategorySeparator = (category?: string | null): string =>
    category
        ?.split(TICKET_CUSTOM_FIELDS_API_SEPARATOR)
        .join(TICKET_CUSTOM_FIELDS_NEW_SEPARATOR) || NOT_AVAILABLE_PLACEHOLDER

export const transformCategoriesSeparator = (allData?: (string | null)[]) =>
    allData?.map(transformCategorySeparator) || []
