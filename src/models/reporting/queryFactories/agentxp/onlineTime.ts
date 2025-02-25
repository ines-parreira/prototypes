import { OrderDirection } from 'models/api/types'
import {
    AgentTimeTrackingCube,
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import { ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    AgentTimeTrackingStatsFiltersMembers,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
} from 'utils/reporting'

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
