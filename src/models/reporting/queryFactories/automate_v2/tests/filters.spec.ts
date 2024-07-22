import {BillableTicketDatasetFilterMember} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import {
    billableTicketDatasetAdditionalFilters,
    mapTicketChannelsToAutomateChannels,
} from 'models/reporting/queryFactories/automate_v2/filters'
import {ReportingFilterOperator} from 'models/reporting/types'
import {fromLegacyStatsFilters} from 'state/stats/utils'

describe('billableTicketDatasetAdditionalFilters', () => {
    const legacyStatsFilters = {
        period: {
            start_datetime: '',
            end_datetime: '',
        },
        channels: ['email', 'contact_form'],
    }
    const statsFiltersWithLogicalOperator =
        fromLegacyStatsFilters(legacyStatsFilters)

    it.each([legacyStatsFilters, statsFiltersWithLogicalOperator])(
        'should return BillableTickets filter for channels',
        (statsFilters) => {
            const reportingFilters =
                billableTicketDatasetAdditionalFilters(statsFilters)

            expect(reportingFilters).toContainEqual({
                member: BillableTicketDatasetFilterMember.Channel,
                operator: ReportingFilterOperator.Equals,
                values: mapTicketChannelsToAutomateChannels(
                    statsFilters.channels
                ),
            })
        }
    )

    it('should return no filter when no channels filter', () => {
        const statsFilters = {
            period: {
                start_datetime: '',
                end_datetime: '',
                channels: undefined,
            },
        }
        const reportingFilters =
            billableTicketDatasetAdditionalFilters(statsFilters)

        expect(reportingFilters).toEqual([])
    })

    it('should return no filter when no channels filter', () => {
        const statsFilters = {
            period: {
                start_datetime: '',
                end_datetime: '',
            },
        }
        const reportingFilters =
            billableTicketDatasetAdditionalFilters(statsFilters)

        expect(reportingFilters).toEqual([])
    })
})

describe('mapTicketChannelsToAutomateChannels', () => {
    it('should return empty array on undefined', () => {
        expect(mapTicketChannelsToAutomateChannels(undefined)).toEqual([])
    })
})
