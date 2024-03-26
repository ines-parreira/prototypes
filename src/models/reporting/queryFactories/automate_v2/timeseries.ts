import {ReportingGranularity, TimeSeriesQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {getFilterDateRange} from 'utils/reporting'
import {
    AutomationDatasetMeasure,
    AutomationDatasetCube,
    AutomationDatasetDimension,
} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {
    BillableTicketDatasetCube,
    BillableTicketDatasetDimension,
    BillableTicketDatasetMeasure,
} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'

export const interactionsTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery<AutomationDatasetCube> => ({
    measures: [
        AutomationDatasetMeasure.AutomatedInteractions,
        AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
    ],
    dimensions: [],
    timeDimensions: [
        {
            dimension:
                AutomationDatasetDimension.AutomationEventCreatedDatetime,
            granularity,
            dateRange: getFilterDateRange(filters),
        },
    ],
    timezone,
    filters: [],
})

export const interactionsByEventTypeTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery<AutomationDatasetCube> => ({
    measures: [AutomationDatasetMeasure.AutomatedInteractions],
    dimensions: [AutomationDatasetDimension.EventType],
    timeDimensions: [
        {
            dimension:
                AutomationDatasetDimension.AutomationEventCreatedDatetime,
            granularity,
            dateRange: getFilterDateRange(filters),
        },
    ],
    timezone,
    filters: [],
})

export const billableTicketDatasetTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery<BillableTicketDatasetCube> => ({
    measures: [BillableTicketDatasetMeasure.BillableTicketCount],
    dimensions: [],
    timeDimensions: [
        {
            dimension: BillableTicketDatasetDimension.TicketCreatedDatetime,
            granularity,
            dateRange: getFilterDateRange(filters),
        },
    ],
    timezone,
    filters: [],
})
