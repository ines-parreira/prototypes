import {TicketChannel} from 'business/types/ticket'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {messagesSentQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import {
    agentFilter,
    formatReportingQueryDate,
    HelpCenterStatsFiltersMembers,
    periodToReportingGranularity,
    renameCubeStringified,
    renameMember,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
    withFilter,
} from 'utils/reporting'

describe('reporting utils', () => {
    describe('formatReportingQueryDate', () => {
        it('should remove the timezone', () => {
            expect(
                formatReportingQueryDate('2020-01-02T03:04:56.789-10:00')
            ).toBe('2020-01-02T03:04:56.789')
        })
    })

    describe('statsFiltersToReportingFilters', () => {
        it('should convert StatsFilters to an array of ReportingFilter', () => {
            expect(
                statsFiltersToReportingFilters(TicketStatsFiltersMembers, {
                    period: {
                        start_datetime: '2021-05-29T00:00:00.000+02:00',
                        end_datetime: '2021-06-04T23:59:59.000+02:00',
                    },
                    channels: [TicketChannel.Email, TicketChannel.Chat],
                    integrations: [1],
                    agents: [2],
                    tags: [1, 2],
                })
            ).toMatchSnapshot()
        })

        it('should convert StatsFilters to an array of ReportingFilter with help center id', () => {
            expect(
                statsFiltersToReportingFilters(HelpCenterStatsFiltersMembers, {
                    period: {
                        start_datetime: '2021-05-29T00:00:00.000+02:00',
                        end_datetime: '2021-06-04T23:59:59.000+02:00',
                    },
                    helpCenters: [1],
                    localeCodes: ['en-US'],
                })
            ).toMatchInlineSnapshot(`
                [
                  {
                    "member": "HelpCenterTrackingEvent.periodStart",
                    "operator": "afterDate",
                    "values": [
                      "2021-05-29T00:00:00.000",
                    ],
                  },
                  {
                    "member": "HelpCenterTrackingEvent.periodEnd",
                    "operator": "beforeDate",
                    "values": [
                      "2021-06-04T23:59:59.000",
                    ],
                  },
                  {
                    "member": "HelpCenterTrackingEvent.helpCenterId",
                    "operator": "equals",
                    "values": [
                      "1",
                    ],
                  },
                  {
                    "member": "HelpCenterTrackingEvent.localeCode",
                    "operator": "equals",
                    "values": [
                      "en-us",
                    ],
                  },
                ]
            `)
        })
    })

    describe('periodToReportingGranularity', () => {
        it('should return "month" when dates range is larger than 3 months', () => {
            expect(
                periodToReportingGranularity({
                    start_datetime: '2020-01-01T00:00:00.000Z',
                    end_datetime: '2021-01-01T00:00:00.000Z',
                })
            ).toBe(ReportingGranularity.Month)
        })

        it('should return "week" when dates range is larger than 1 month', () => {
            expect(
                periodToReportingGranularity({
                    start_datetime: '2020-01-01T00:00:00.000Z',
                    end_datetime: '2020-02-15T00:00:00.000Z',
                })
            ).toBe(ReportingGranularity.Week)
        })

        it('should return "days" when dates range is a period of one month and one day', () => {
            expect(
                periodToReportingGranularity({
                    start_datetime: '2020-01-15T00:00:00.000Z',
                    end_datetime: '2020-02-15T00:00:00.000Z',
                })
            ).toBe(ReportingGranularity.Day)
        })

        it('should return "days" when dates range is larger than 1 day', () => {
            expect(
                periodToReportingGranularity({
                    start_datetime: '2020-01-01T00:00:00.000Z',
                    end_datetime: '2020-01-03T00:00:00.000Z',
                })
            ).toBe(ReportingGranularity.Day)
        })

        it('should return "hour" when dates range is smaller than 1 day', () => {
            expect(
                periodToReportingGranularity({
                    start_datetime: '2020-01-01T00:00:00.000Z',
                    end_datetime: '2020-01-01T12:00:00.000Z',
                })
            ).toBe(ReportingGranularity.Hour)
        })
    })

    describe('withFilter', () => {
        it('should add a filter to the query', () => {
            const query = messagesSentQueryFactory(
                {
                    period: {
                        start_datetime: '2020-01-01T00:00:00.000Z',
                        end_datetime: '2020-01-03T00:00:00.000Z',
                    },
                },
                'timezone'
            )
            const filter = {
                member: TicketMember.AssigneeUserId,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            }

            const queryWithFilter = withFilter(query, filter)

            expect(queryWithFilter.filters).toContainEqual(filter)
        })
    })

    describe('agentFilter', () => {
        it('should return Agent filter with agentId', () => {
            const agentId = '123'
            expect(agentFilter(agentId)).toEqual({
                member: TicketMember.AssigneeUserId,
                operator: ReportingFilterOperator.Set,
                values: [agentId],
            })
        })

        it('should return Agent filter with no values', () => {
            expect(agentFilter()).toEqual({
                member: TicketMember.AssigneeUserId,
                operator: ReportingFilterOperator.Set,
                values: [],
            })
        })
    })

    describe('renameCube', () => {
        it('should rename the member', () => {
            expect(
                renameMember(
                    'TicketMessages.firstHelpdeskMessageDatetime',
                    'Ticket',
                    'TicketEnriched'
                )
            ).toEqual('TicketMessages.firstHelpdeskMessageDatetime')

            expect(
                renameMember(
                    'Ticket.firstHelpdeskMessageDatetime',
                    'Ticket',
                    'TicketEnriched'
                )
            ).toEqual('TicketEnriched.firstHelpdeskMessageDatetime')
        })

        it('should rename Cube name in all fields', () => {
            const query = messagesSentQueryFactory(
                {
                    period: {
                        start_datetime: '2020-01-01T00:00:00.000Z',
                        end_datetime: '2020-01-03T00:00:00.000Z',
                    },
                },
                'timezone'
            )

            expect(
                renameCubeStringified(query, 'Ticket', 'TicketEnriched')
            ).toEqual({
                measures: ['HelpdeskMessage.messageCount'],
                dimensions: [],
                timezone: 'timezone',
                filters: [
                    {
                        member: 'TicketEnriched.periodStart',
                        operator: 'afterDate',
                        values: ['2020-01-01T00:00:00.000'],
                    },
                    {
                        member: 'TicketEnriched.periodEnd',
                        operator: 'beforeDate',
                        values: ['2020-01-03T00:00:00.000'],
                    },
                    {
                        member: 'HelpdeskMessage.sentDatetime',
                        operator: 'inDateRange',
                        values: [
                            '2020-01-01T00:00:00.000',
                            '2020-01-03T00:00:00.000',
                        ],
                    },
                    {
                        member: 'TicketEnriched.isTrashed',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'TicketEnriched.isSpam',
                        operator: 'equals',
                        values: ['0'],
                    },
                    {
                        member: 'HelpdeskMessage.isMessagePublic',
                        operator: 'equals',
                        values: ['1'],
                    },
                    {
                        member: 'HelpdeskMessage.messageVia',
                        operator: 'in',
                        values: ['helpdesk', 'api'],
                    },
                    {
                        member: 'HelpdeskMessage.periodStart',
                        operator: 'afterDate',
                        values: ['2020-01-01T00:00:00.000'],
                    },
                    {
                        member: 'HelpdeskMessage.periodEnd',
                        operator: 'beforeDate',
                        values: ['2020-01-03T00:00:00.000'],
                    },
                ],
            })
        })
    })
})
