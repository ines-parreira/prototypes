import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { AgentTimeTrackingCube } from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import {
    AgentTimeTrackingStatsFiltersMembers,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

export const onlineTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AgentTimeTrackingCube> => ({
    metricName: METRIC_NAMES.AGENTXP_ONLINE_TIME,
    measures: [AgentTimeTrackingMeasure.OnlineTime],
    dimensions: [],
    timezone,
    filters: [
        ...statsFiltersToReportingFilters(
            AgentTimeTrackingStatsFiltersMembers,
            filters,
        ),
    ],
    ...(sorting
        ? {
              order: [[AgentTimeTrackingMeasure.OnlineTime, sorting]],
          }
        : {}),
})

export const onlineTimePerAgentQueryFactory = perDimensionQueryFactory(
    onlineTimeQueryFactory,
    AgentTimeTrackingDimension.UserId,
    METRIC_NAMES.AGENTXP_ONLINE_TIME_PER_AGENT,
)
