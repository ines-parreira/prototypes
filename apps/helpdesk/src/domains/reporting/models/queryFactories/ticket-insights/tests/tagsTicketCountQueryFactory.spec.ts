import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketTagsEnrichedDimension,
    TicketTagsEnrichedMeasure,
} from 'domains/reporting/models/cubes/TicketTagsEnrichedCube'
import { tagsTicketCountQueryFactory } from 'domains/reporting/models/queryFactories/ticket-insights/tagsTicketCount'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

const periodStart = '2021-05-29T00:00:00.000'
const periodEnd = '2021-06-04T23:59:59.000'
const statsFilters = {
    period: {
        start_datetime: periodStart,
        end_datetime: periodEnd,
    },
}
const timezone = 'UTC'
const sorting = OrderDirection.Asc

describe('tagsTicketCountQueryFactory', () => {
    it('should build expected query', () => {
        const query = tagsTicketCountQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            metricName: METRIC_NAMES.TICKET_INSIGHTS_TAGS_TICKET_COUNT,
            measures: [TicketTagsEnrichedMeasure.TicketCount],
            dimensions: [TicketTagsEnrichedDimension.TagId],
            timezone,
            segments: [],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
            ],
        })
    })

    it('should build expected query with sorting', () => {
        const query = tagsTicketCountQueryFactory(
            statsFilters,
            timezone,
            sorting,
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.TICKET_INSIGHTS_TAGS_TICKET_COUNT,
            measures: [TicketTagsEnrichedMeasure.TicketCount],
            dimensions: [TicketTagsEnrichedDimension.TagId],
            timezone,
            segments: [],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters,
                ),
            ],
            order: [[TicketTagsEnrichedMeasure.TicketCount, sorting]],
        })
    })
})
