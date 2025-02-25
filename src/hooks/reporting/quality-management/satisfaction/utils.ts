import {
    useAverageCSATPerAssigneeTimeseries,
    useAverageCSATPerChannelTimeseries,
    useAverageCSATPerIntegrationTimeseries,
} from 'hooks/reporting/quality-management/satisfaction/useAverageScorePerDimensionTimeSeries'
import { TimeSeriesPerDimensionHook } from 'hooks/reporting/useTimeSeries'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import { TicketMessagesDimension } from 'models/reporting/cubes/TicketMessagesCube'

export const getMetricQuery = (
    dimension:
        | TicketDimension.AssigneeUserId
        | TicketDimension.Channel
        | TicketMessagesDimension.Integration,
): TimeSeriesPerDimensionHook => {
    switch (dimension) {
        case TicketDimension.AssigneeUserId:
            return useAverageCSATPerAssigneeTimeseries
        case TicketDimension.Channel:
            return useAverageCSATPerChannelTimeseries
        case TicketMessagesDimension.Integration:
            return useAverageCSATPerIntegrationTimeseries
    }
}
