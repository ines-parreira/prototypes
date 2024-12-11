import {TicketChannel} from 'business/types/ticket'
import {HelpCenterTrackingEventMember} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketSLAMember} from 'models/reporting/cubes/sla/TicketSLACube'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesMember} from 'models/reporting/cubes/TicketMessagesCube'
import {messagesSentQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {withLogicalOperator} from 'models/reporting/queryFactories/utils'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'models/reporting/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {
    agentFilter,
    calculatePercentage,
    formatReportingQueryDate,
    getPreviousPeriod,
    HelpCenterStatsFiltersMembers,
    matchAndCalculateAllEntries,
    periodToReportingGranularity,
    sortAllData,
    statsFiltersToReportingFilters,
    TicketSLAStatsFiltersMembers,
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
                    score: ['3', '4'],
                    resolutionCompleteness: ['3', '4'],
                    communicationSkills: ['3', '4'],
                    languageProficiency: ['3', '4'],
                    accuracy: ['3', '4'],
                    efficiency: ['3', '4'],
                    internalCompliance: ['3', '4'],
                    brandVoice: ['3', '4'],
                })
            ).toEqual([
                {
                    member: TicketMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: ['2021-05-29T00:00:00.000'],
                },
                {
                    member: TicketMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: ['2021-06-04T23:59:59.000'],
                },
                {
                    member: TicketMessagesMember.Integration,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: TicketMember.Channel,
                    operator: ReportingFilterOperator.Equals,
                    values: ['email', 'chat'],
                },
                {
                    member: TicketMember.AssigneeUserId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['2'],
                },
                {
                    member: TicketMember.Tags,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1', '2'],
                },
                {
                    member: TicketMember.SurveyScore,
                    operator: ReportingFilterOperator.Equals,
                    values: ['3', '4'],
                },
                {
                    member: TicketMember.ResolutionCompletenessScore,
                    operator: ReportingFilterOperator.Equals,
                    values: ['3', '4'],
                },
                {
                    member: TicketMember.CommunicationSkillsScore,
                    operator: ReportingFilterOperator.Equals,
                    values: ['3', '4'],
                },
                {
                    member: TicketMember.LanguageProficiencyScore,
                    operator: ReportingFilterOperator.Equals,
                    values: ['3', '4'],
                },
                {
                    member: TicketMember.AccuracyScore,
                    operator: ReportingFilterOperator.Equals,
                    values: ['3', '4'],
                },
                {
                    member: TicketMember.EfficiencyScore,
                    operator: ReportingFilterOperator.Equals,
                    values: ['3', '4'],
                },
                {
                    member: TicketMember.InternalComplianceScore,
                    operator: ReportingFilterOperator.Equals,
                    values: ['3', '4'],
                },
                {
                    member: TicketMember.BrandVoiceScore,
                    operator: ReportingFilterOperator.Equals,
                    values: ['3', '4'],
                },
            ])
        })

        it('should convert SLAStatsFilters to an array of ReportingFilter', () => {
            const statsFilters = {
                period: {
                    start_datetime: '2021-05-29T00:00:00.000+02:00',
                    end_datetime: '2021-06-04T23:59:59.000+02:00',
                },
                channels: [TicketChannel.Email, TicketChannel.Chat],
                integrations: [1],
                agents: [2],
                tags: [1, 2],
                slaPolicies: ['2', '4'],
            }

            expect(
                statsFiltersToReportingFilters(
                    TicketSLAStatsFiltersMembers,
                    statsFilters
                )
            ).toEqual([
                ...statsFiltersToReportingFilters(
                    TicketStatsFiltersMembers,
                    statsFilters
                ),
                {
                    member: TicketSLAMember.SlaPolicyUuid,
                    operator: ReportingFilterOperator.Equals,
                    values: statsFilters.slaPolicies,
                },
            ])
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
            ).toEqual([
                {
                    member: HelpCenterTrackingEventMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: ['2021-05-29T00:00:00.000'],
                },
                {
                    member: HelpCenterTrackingEventMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: ['2021-06-04T23:59:59.000'],
                },
                {
                    member: HelpCenterTrackingEventMember.HelpCenterId,
                    operator: ReportingFilterOperator.Equals,
                    values: ['1'],
                },
                {
                    member: HelpCenterTrackingEventMember.LocaleCode,
                    operator: ReportingFilterOperator.Equals,
                    values: ['en-us'],
                },
            ])
        })

        it('should convert StatsFilters to an array of ReportingFilter with help center with logical operator', () => {
            expect(
                statsFiltersToReportingFilters(HelpCenterStatsFiltersMembers, {
                    period: {
                        start_datetime: '2021-05-29T00:00:00.000+02:00',
                        end_datetime: '2021-06-04T23:59:59.000+02:00',
                    },
                    helpCenters: withLogicalOperator(
                        [1],
                        LogicalOperatorEnum.NOT_ONE_OF
                    ),
                })
            ).toEqual([
                {
                    member: HelpCenterTrackingEventMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: ['2021-05-29T00:00:00.000'],
                },
                {
                    member: HelpCenterTrackingEventMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: ['2021-06-04T23:59:59.000'],
                },
                {
                    member: HelpCenterTrackingEventMember.HelpCenterId,
                    operator: ReportingFilterOperator.NotEquals,
                    values: ['1'],
                },
            ])
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

    describe('getPreviousPeriod', () => {
        it('should return equal period ending second before the original starts', () => {
            const period = {
                start_datetime: '2020-01-05T00:00:00.000Z',
                end_datetime: '2020-01-07T00:00:00.000Z',
            }

            expect(getPreviousPeriod(period)).toEqual({
                start_datetime: '2020-01-02T23:59:59Z',
                end_datetime: '2020-01-04T23:59:59Z',
            })
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

    describe('calculatePercentage', () => {
        it('should return percentage', () => {
            const a = 5
            const b = 10

            expect(calculatePercentage(a, b)).toEqual((a / b) * 100)
        })
    })

    describe('matchAndCalculateAllEntries', () => {
        it('should match data from two sources and apply a calculation of selected metrics', () => {
            const dataAIdField = HelpdeskMessageDimension.TicketId
            const dataBIdField = TicketDimension.TicketId
            const dataAMeasureField = HelpdeskMessageMeasure.MessageCount
            const dataBMeasureField = TicketMeasure.TicketCount
            const metricAData = {
                data: {
                    value: null,
                    decile: null,
                    allData: [
                        {
                            [dataAIdField]: '1',
                            [dataAMeasureField]: '30',
                        },
                        {
                            [dataAIdField]: '2',
                            [dataAMeasureField]: '50',
                        },
                        {
                            [dataAIdField]: '3',
                            [dataAMeasureField]: '70',
                        },
                        {
                            [dataAIdField]: '4',
                            [dataAMeasureField]: '90',
                        },
                    ],
                },
            }
            const metricBData = {
                data: {
                    value: null,
                    decile: null,
                    allData: [
                        {
                            [dataBIdField]: '1',
                            [dataBMeasureField]: '100',
                        },
                        {
                            [dataBIdField]: '2',
                            [dataBMeasureField]: '200',
                        },
                        {
                            [dataBIdField]: '3',
                            [dataBMeasureField]: '300',
                        },
                    ],
                },
            }

            const calculation = (a: number, b: number) => a + b

            expect(
                matchAndCalculateAllEntries(
                    metricAData,
                    metricBData,
                    calculation,
                    dataAIdField,
                    dataBIdField,
                    dataAMeasureField,
                    dataBMeasureField
                )
            ).toEqual([
                {
                    [dataAIdField]: '1',
                    [dataAMeasureField]: '130',
                },
                {
                    [dataAIdField]: '2',
                    [dataAMeasureField]: '250',
                },
                {
                    [dataAIdField]: '3',
                    [dataAMeasureField]: '370',
                },
                {
                    [dataAIdField]: '4',
                    [dataAMeasureField]: null,
                },
            ])
        })
    })

    describe('sortAllData', () => {
        it('should sort data by given metric', () => {
            const idField = TicketDimension.TicketId
            const metricField = HelpdeskMessageMeasure.MessageCount
            const anotherMetricField = TicketMeasure.TicketCount

            const data = [
                {
                    [idField]: '3',
                    [metricField]: '370',
                    [anotherMetricField]: '4730',
                },
                {
                    [idField]: '1',
                    [metricField]: '130',
                    [anotherMetricField]: '4310',
                },
                {
                    [idField]: '2',
                    [metricField]: '250',
                    [anotherMetricField]: '4520',
                },
                {
                    [idField]: '4',
                    [metricField]: null,
                    [anotherMetricField]: '4520',
                },
            ]

            expect(sortAllData(data, metricField)).toEqual([
                {
                    [idField]: '1',
                    [metricField]: '130',
                    [anotherMetricField]: '4310',
                },
                {
                    [idField]: '2',
                    [metricField]: '250',
                    [anotherMetricField]: '4520',
                },
                {
                    [idField]: '3',
                    [metricField]: '370',
                    [anotherMetricField]: '4730',
                },
                {
                    [idField]: '4',
                    [metricField]: null,
                    [anotherMetricField]: '4520',
                },
            ])
        })
    })
})
