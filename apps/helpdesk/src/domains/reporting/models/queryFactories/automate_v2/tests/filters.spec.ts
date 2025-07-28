import { AutomationDatasetFilterMember } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { BillableTicketDatasetFilterMember } from 'domains/reporting/models/cubes/automate_v2/BillableTicketDatasetCube'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import { TicketCustomFieldsMember } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { TicketMessagesMember } from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    aiAgentTicketsDefaultFilters,
    aiAgentTicketsFromTicketCustomFieldsDefaultFilters,
    automationDatasetAdditionalFilters,
    billableTicketDatasetAdditionalFilters,
    mapTicketChannelsToAutomateChannels,
} from 'domains/reporting/models/queryFactories/automate_v2/filters'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'

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
    const intentFieldId = 1
    const outcomeFieldId = 2
    const filters: StatsFilters = {
        period: {
            start_datetime: '2021-01-01T00:00:00.000',
            end_datetime: '2021-01-02T00:00:00.000',
        },
    }

    it('should return default filters with outcome and intent field ids and outcome values to exclude', () => {
        const result = aiAgentTicketsDefaultFilters({
            filters,
            outcomeFieldId: outcomeFieldId,
            intentFieldId: intentFieldId,
            outcomeValuesToExclude: [`${outcomeFieldId}::handover`],
        })
        expect(result).toEqual([
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: ['2021-01-01T00:00:00.000', '2021-01-02T00:00:00.000'],
            },
            {
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotEquals,
                values: [
                    `${intentFieldId}::Other::No Reply`,
                    `${intentFieldId}::Other::No Reply::Other`,
                    `${intentFieldId}::Other::Spam::Other`,
                    `${intentFieldId}::Other::Spam`,
                    `${outcomeFieldId}::Close::Without message`,
                    `${outcomeFieldId}::handover`,
                ],
            },
            {
                member: TicketMessagesMember.IntegrationChannelPair,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
        ])
    })

    it('should return default filters without outcome values to exclude', () => {
        const result = aiAgentTicketsDefaultFilters({
            filters,
            outcomeFieldId: outcomeFieldId,
            intentFieldId: intentFieldId,
        })
        expect(result).toEqual([
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: ['2021-01-01T00:00:00.000', '2021-01-02T00:00:00.000'],
            },
            {
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotEquals,
                values: [
                    `${intentFieldId}::Other::No Reply`,
                    `${intentFieldId}::Other::No Reply::Other`,
                    `${intentFieldId}::Other::Spam::Other`,
                    `${intentFieldId}::Other::Spam`,
                    `${outcomeFieldId}::Close::Without message`,
                ],
            },
            {
                member: TicketMessagesMember.IntegrationChannelPair,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
        ])
    })

    it('should return default filters with integration ids', () => {
        const result = aiAgentTicketsDefaultFilters({
            filters,
            outcomeFieldId: outcomeFieldId,
            intentFieldId: intentFieldId,
            integrationIds: ['chat::1', 'email::2'],
        })
        expect(result).toEqual([
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: ['2021-01-01T00:00:00.000', '2021-01-02T00:00:00.000'],
            },
            {
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotEquals,
                values: [
                    `${intentFieldId}::Other::No Reply`,
                    `${intentFieldId}::Other::No Reply::Other`,
                    `${intentFieldId}::Other::Spam::Other`,
                    `${intentFieldId}::Other::Spam`,
                    `${outcomeFieldId}::Close::Without message`,
                ],
            },
            {
                member: TicketMessagesMember.IntegrationChannelPair,
                operator: ReportingFilterOperator.Equals,
                values: ['chat::1', 'email::2'],
            },
        ])
    })
})

describe('aiAgentTicketsFromTicketCustomFieldsDefaultFilters', () => {
    const outcomeFieldId = 1
    const filters = {
        period: {
            start_datetime: '2023-01-01T00:00:00.000',
            end_datetime: '2023-01-31T23:59:59.999',
        },
    }

    it('should return filters with outcome and integration IDs', () => {
        const result = aiAgentTicketsFromTicketCustomFieldsDefaultFilters({
            filters,
            outcomeFieldId: outcomeFieldId,
            integrationIds: ['chat::1', 'email::2'],
            outcomeValuesToExclude: ['handover'],
            outcomeValueToInclude: 'success',
        })

        expect(result).toEqual([
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: ['2023-01-01T00:00:00.000', '2023-01-31T23:59:59.999'],
            },
            {
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotEquals,
                values: [`${outcomeFieldId}::Close::Without message`],
            },
            {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: [`${outcomeFieldId}::success`],
            },
            {
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotEquals,
                values: [`${outcomeFieldId}::handover`],
            },
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                operator: ReportingFilterOperator.NotEquals,
                values: [
                    'Other::No Reply',
                    'Other::No Reply::Other',
                    'Other::Spam::Other',
                    'Other::Spam',
                ],
            },
            {
                member: TicketMessagesMember.IntegrationChannelPair,
                operator: ReportingFilterOperator.Equals,
                values: ['chat::1', 'email::2'],
            },
        ])
    })

    it('should return default filters when optional parameters are not provided', () => {
        const result = aiAgentTicketsFromTicketCustomFieldsDefaultFilters({
            filters,
            outcomeFieldId: outcomeFieldId,
        })

        expect(result).toEqual([
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: ['2023-01-01T00:00:00.000', '2023-01-31T23:59:59.999'],
            },
            {
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotEquals,
                values: ['1::Close::Without message'],
            },
            {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: ['1::'],
            },
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                operator: ReportingFilterOperator.NotEquals,
                values: [
                    'Other::No Reply',
                    'Other::No Reply::Other',
                    'Other::Spam::Other',
                    'Other::Spam',
                ],
            },
            {
                member: TicketMessagesMember.IntegrationChannelPair,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
        ])
    })

    it('should handle empty outcomeValuesToExclude gracefully', () => {
        const result = aiAgentTicketsFromTicketCustomFieldsDefaultFilters({
            filters,
            outcomeFieldId: 1,
            outcomeValuesToExclude: [],
        })

        expect(result).toEqual([
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: ['2023-01-01T00:00:00.000', '2023-01-31T23:59:59.999'],
            },
            {
                member: TicketMember.CustomFieldToExclude,
                operator: ReportingFilterOperator.NotEquals,
                values: ['1::Close::Without message'],
            },
            {
                member: TicketMember.CustomField,
                operator: ReportingFilterOperator.StartsWith,
                values: ['1::'],
            },
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                operator: ReportingFilterOperator.NotEquals,
                values: [
                    'Other::No Reply',
                    'Other::No Reply::Other',
                    'Other::Spam::Other',
                    'Other::Spam',
                ],
            },
            {
                member: TicketMessagesMember.IntegrationChannelPair,
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
        ])
    })

    it('should handle outcomeValuesToExclude with a valid outcomeFieldId', () => {
        const result = aiAgentTicketsFromTicketCustomFieldsDefaultFilters({
            filters: {
                period: {
                    start_datetime: '2023-01-01T00:00:00.000',
                    end_datetime: '2023-01-31T23:59:59.999',
                },
            },
            outcomeFieldId: 1,
            outcomeValuesToExclude: ['handover', 'failure'],
        })

        expect(result).toContainEqual({
            member: TicketMember.CustomFieldToExclude,
            operator: ReportingFilterOperator.NotEquals,
            values: ['1::handover', '1::failure'],
        })
    })

    it('should handle outcomeValuesToExclude without outcomeFieldId', () => {
        const result = aiAgentTicketsFromTicketCustomFieldsDefaultFilters({
            filters: {
                period: {
                    start_datetime: '2023-01-01T00:00:00.000',
                    end_datetime: '2023-01-31T23:59:59.999',
                },
            },
            outcomeValuesToExclude: ['handover', 'failure'],
        })

        expect(result).toContainEqual({
            member: TicketMember.CustomFieldToExclude,
            operator: ReportingFilterOperator.NotEquals,
            values: ['-1::handover', '-1::failure'],
        })
    })
})
