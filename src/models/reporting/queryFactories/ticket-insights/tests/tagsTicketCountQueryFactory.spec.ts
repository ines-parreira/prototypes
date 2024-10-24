import {OrderDirection} from 'models/api/types'
import {
    TicketTagsEnrichedMeasure,
    TicketTagsEnrichedDimension,
} from 'models/reporting/cubes/TicketTagsEnrichedCube'
import {tagsTicketCountQueryFactory} from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

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
            measures: [TicketTagsEnrichedMeasure.TicketCount],
            dimensions: [TicketTagsEnrichedDimension.TagId],
            timezone,
            segments: [],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
            ],
        })
    })

    it('should build expected query with sorting', () => {
        const query = tagsTicketCountQueryFactory(
            statsFilters,
            timezone,
            sorting
        )

        expect(query).toEqual({
            measures: [TicketTagsEnrichedMeasure.TicketCount],
            dimensions: [TicketTagsEnrichedDimension.TagId],
            timezone,
            segments: [],
            filters: [
                ...NotSpamNorTrashedTicketsFilter,
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
            ],
            order: [[TicketTagsEnrichedMeasure.TicketCount, sorting]],
        })
    })
})
