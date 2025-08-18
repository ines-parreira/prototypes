import { TicketCubeWithJoins } from 'domains/reporting/models/cubes/TicketCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import { OrderDirection } from 'models/api/types'

// TODO: Implement
export function humanResponseTimeAfterAiHandoffQueryFactory(
    __statsFilters: StatsFilters,
    __timezone: string,
    __sorting?: OrderDirection,
) {
    return {
        measures: [],
        dimensions: [],
        filters: [],
    }
}

// TODO: Implement
export function humanResponseTimeAfterAiHandoffPerChannelQueryFactory(
    __statsFilters: StatsFilters,
    __timezone: string,
    __sorting?: OrderDirection,
) {
    return {
        measures: [],
        dimensions: [],
        filters: [],
    }
}

// TODO: Implement
export function humanResponseTimeAfterAiHandoffDrillDownQueryFactory(
    __statsFilters: StatsFilters,
    __timezone: string,
    __sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> {
    return {
        measures: [],
        dimensions: [],
        filters: [],
    }
}
