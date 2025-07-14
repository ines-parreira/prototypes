import {
    AgentTimeTrackingCube,
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import {
    AgentTimeTrackingStatsFiltersMembers,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const onlineTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AgentTimeTrackingCube> => ({
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
)
