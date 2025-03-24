import { AutomationDatasetFilterMember } from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import { BillableTicketDatasetFilterMember } from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import { TicketMember } from 'models/reporting/cubes/TicketCube'
import {
    aiAgentTicketsDefaultFilters,
    automationDatasetAdditionalFilters,
    billableTicketDatasetAdditionalFilters,
    mapTicketChannelsToAutomateChannels,
} from 'models/reporting/queryFactories/automate_v2/filters'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'

describe('billableTicketDatasetAdditionalFilters', () => {
    const statsFiltersWithLogicalOperator: StatsFilters = {
        period: {
            start_datetime: '',
            end_datetime: '',
        },
        channels: withDefaultLogicalOperator(['email', 'contact_form']),
    }

    it.each([statsFiltersWithLogicalOperator])(
        'should return BillableTickets filter for channels',
        (statsFilters) => {
            const reportingFilters =
                billableTicketDatasetAdditionalFilters(statsFilters)

            expect(reportingFilters).toContainEqual({
                member: BillableTicketDatasetFilterMember.Channel,
                operator: ReportingFilterOperator.Equals,
                values: mapTicketChannelsToAutomateChannels(
                    statsFiltersWithLogicalOperator.channels?.values,
                ),
            })
        },
    )

    it('should return no filter when channels filter is undefined in filters state', () => {
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

    it('should return no filter when there is no channels filter key in filters state', () => {
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

describe('automationDatasetAdditionalFilters', () => {
    const statsFiltersWithLogicalOperator: StatsFilters = {
        period: {
            start_datetime: '',
            end_datetime: '',
        },
        channels: withDefaultLogicalOperator(['email', 'contact_form']),
    }

    it.each([statsFiltersWithLogicalOperator])(
        'should return BillableTickets filter for channels',
        (statsFilters) => {
            const reportingFilters =
                automationDatasetAdditionalFilters(statsFilters)

            expect(reportingFilters).toContainEqual({
                member: AutomationDatasetFilterMember.Channel,
                operator: ReportingFilterOperator.Equals,
                values: mapTicketChannelsToAutomateChannels(
                    statsFiltersWithLogicalOperator.channels?.values,
                ),
            })
        },
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

describe('aiAgentTicketsDefaultFilters', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2021-01-01T00:00:00.000',
            end_datetime: '2021-01-02T00:00:00.000',
        },
    }

    it('should return default filters with outcome and intent field ids and outcome values to exclude', () => {
        const result = aiAgentTicketsDefaultFilters({
            filters,
            outcomeFieldId: 1,
            intentFieldId: 2,
            outcomeValuesToExclude: ['1::handover'],
        })
        expect(result).toEqual([
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: ['2021-01-01T00:00:00.000', '2021-01-02T00:00:00.000'],
            },
            {
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotStartsWith,
                values: ['2::Other::No Reply'],
            },
            {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.NotStartsWith,
                values: ['1::Close::Without message', '1::handover'],
            },
        ])
    })

    it('should return default filters without outcome values to exclude', () => {
        const result = aiAgentTicketsDefaultFilters({
            filters,
            outcomeFieldId: 1,
            intentFieldId: 2,
        })
        expect(result).toEqual([
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: ['2021-01-01T00:00:00.000', '2021-01-02T00:00:00.000'],
            },
            {
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotStartsWith,
                values: ['2::Other::No Reply'],
            },
            {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.NotStartsWith,
                values: ['1::Close::Without message'],
            },
        ])
    })
})
