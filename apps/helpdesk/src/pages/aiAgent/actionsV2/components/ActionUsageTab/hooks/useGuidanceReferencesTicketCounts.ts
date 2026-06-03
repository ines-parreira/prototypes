import { useMemo } from 'react'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    TicketInsightsTaskDimension,
    TicketInsightsTaskDimensionV2,
    TicketInsightsTaskMeasure,
    TicketInsightsTaskMeasureV2,
} from 'domains/reporting/models/cubes/TicketInsightsTaskCube'
import {
    createV1Query,
    getLast28DaysDateRange,
    KNOWLEDGE_QUERY_LIMIT,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { knowledgeTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/knowledgeInsights'
import type { ApiStatsFilters } from 'domains/reporting/models/stat/types'
import {
    APIOnlyFilterKey,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

type Params = {
    guidanceSourceIds: string[]
    resourceSourceSetId: number
    shopIntegrationId: number
    timezone: string
    enabled?: boolean
}

type Result = {
    countsBySourceId: Record<string, number>
    isLoading: boolean
    isError: boolean
}

export const useGuidanceReferencesTicketCounts = ({
    guidanceSourceIds,
    resourceSourceSetId,
    shopIntegrationId,
    timezone,
    enabled = true,
}: Params): Result => {
    const dateRange = useMemo(() => getLast28DaysDateRange(), [])

    const filters: ApiStatsFilters = useMemo(
        () => ({
            [FilterKey.Period]: dateRange,
            [APIOnlyFilterKey.ResourceSourceId]:
                withLogicalOperator(guidanceSourceIds),
            [APIOnlyFilterKey.ResourceSourceSetId]: withLogicalOperator([
                String(resourceSourceSetId),
            ]),
            ...(shopIntegrationId && {
                [FilterKey.Stores]: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [shopIntegrationId],
                },
            }),
        }),
        [dateRange, guidanceSourceIds, resourceSourceSetId, shopIntegrationId],
    )

    const v1Query = useMemo(
        () =>
            createV1Query(
                METRIC_NAMES.KNOWLEDGE_TICKETS_TICKET_COUNT,
                null,
                null,
                filters,
                timezone,
                TicketInsightsTaskMeasure.TicketCount,
            ),
        [filters, timezone],
    )

    const v2Query = useMemo(
        () =>
            knowledgeTicketsCountQueryV2Factory({
                timezone,
                filters,
                limit: KNOWLEDGE_QUERY_LIMIT,
            }),
        [filters, timezone],
    )

    const isEnabled =
        enabled &&
        guidanceSourceIds.length > 0 &&
        resourceSourceSetId > 0 &&
        shopIntegrationId > 0

    const ticketsMetric = useMetricPerDimensionV2(
        v1Query,
        v2Query,
        undefined,
        isEnabled,
    )

    const countsBySourceId = useMemo(() => {
        const result: Record<string, number> = {}
        ticketsMetric.data?.allData?.forEach((record) => {
            const sourceId =
                record[TicketInsightsTaskDimensionV2.ResourceSourceId] ??
                record[TicketInsightsTaskDimension.ResourceSourceId]
            if (sourceId == null) return
            const count =
                Number(
                    record[TicketInsightsTaskMeasureV2.TicketCount] ??
                        record[TicketInsightsTaskMeasure.TicketCount],
                ) || 0
            result[String(sourceId)] = count
        })
        return result
    }, [ticketsMetric.data])

    return {
        countsBySourceId,
        isLoading: isEnabled && ticketsMetric.isFetching,
        isError: ticketsMetric.isError,
    }
}
