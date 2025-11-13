import {
    useAverageCSATPerAssigneeTimeseries,
    useAverageCSATPerChannelTimeseries,
    useAverageCSATPerIntegrationTimeseries,
} from 'domains/reporting/hooks/quality-management/satisfaction/useAverageScorePerDimensionTimeSeries'
import { TimeSeriesPerDimensionHook } from 'domains/reporting/hooks/useTimeSeries'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesDimension } from 'domains/reporting/models/cubes/TicketMessagesCube'

export const getMetricQuery = (
    dimension:
        | TicketDimension.AssigneeUserId
        | TicketDimension.Channel
        | TicketMessagesDimension.Integration,
): TimeSeriesPerDimensionHook => {
    // component selection by dimension applies for V1 and V2 metrics
    switch (dimension) {
        case TicketDimension.AssigneeUserId:
            return useAverageCSATPerAssigneeTimeseries
        case TicketDimension.Channel:
            return useAverageCSATPerChannelTimeseries
        case TicketMessagesDimension.Integration:
            return useAverageCSATPerIntegrationTimeseries
    }
}
