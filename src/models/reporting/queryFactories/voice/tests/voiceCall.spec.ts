import moment from 'moment'

import {OrderDirection} from 'models/api/types'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {
    VoiceCallDimension,
    VoiceCallMeasure,
    VoiceCallMember,
    VoiceCallSegment,
} from 'models/reporting/cubes/VoiceCallCube'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {getLiveVoicePeriodFilter} from 'pages/stats/voice/components/LiveVoice/utils'
import {MIN_DATE_FOR_ADVANCED_VOICE_STATS} from 'pages/stats/voice/constants/voiceOverview'
import {AccountSettingType} from 'state/currentAccount/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

import {
    connectedCallsListQueryFactory,
    liveDashboardConnectedCallsListQueryFactory,
    liveDashBoardVoiceCallListQueryFactory,
    liveDashboardWaitingTimeCallsListQueryFactory,
    voiceCallAverageTalkTimePerAgentQueryFactory,
    voiceCallAverageTalkTimeQueryFactory,
    voiceCallAverageWaitTimeQueryFactory,
    voiceCallCountPerAgentQueryFactory,
    voiceCallCountPerFilteringAgentQueryFactory,
    voiceCallCountQueryFactory,
    voiceCallListQueryFactory,
    waitingTimeCallsListQueryFactory,
} from '../voiceCall'

const getLiveVoicePeriodFilterMock = assumeMock(getLiveVoicePeriodFilter)

jest.mock('pages/stats/voice/components/LiveVoice/utils')

const voiceCallListDimensions = [
    VoiceCallDimension.AgentId,
    VoiceCallDimension.CustomerId,
    VoiceCallDimension.Direction,
    VoiceCallDimension.IntegrationId,
    VoiceCallDimension.CreatedAt,
    VoiceCallDimension.Status,
    VoiceCallDimension.Duration,
    VoiceCallDimension.TicketId,
    VoiceCallDimension.PhoneNumberSource,
    VoiceCallDimension.PhoneNumberDestination,
    VoiceCallDimension.TalkTime,
    VoiceCallDimension.WaitTime,
    VoiceCallDimension.VoicemailAvailable,
    VoiceCallDimension.VoicemailUrl,
    VoiceCallDimension.CallRecordingAvailable,
    VoiceCallDimension.CallRecordingUrl,
]

describe('voice queries factories', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    beforeEach(() => {
        getLiveVoicePeriodFilterMock.mockReturnValue({
            end_datetime: periodEnd,
            start_datetime: periodStart,
        })
    })

    it.each([
        [[VoiceCallMeasure.VoiceCallCount], [], undefined],
        [[VoiceCallMeasure.VoiceCallCount], [], VoiceCallSegment.outboundCalls],
    ])(
        'voiceCallQueryFactory should create a query',
        (measures, dimensions, segment) => {
            const query = voiceCallCountQueryFactory(
                statsFilters,
                timezone,
                segment
            )

            expect(query).toEqual({
                measures,
                dimensions,
                filters: [
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                ],
                timezone,
                segments: segment ? [segment] : [],
            })
        }
    )

    it.each([
        [VoiceCallSegment.outboundCalls, 10, 0],
        [undefined, 10, 10],
    ])(
        'voiceCallListQueryFactory should create a query',
        (segment, limit, offset) => {
            const query = voiceCallListQueryFactory(
                statsFilters,
                timezone,
                segment,
                limit,
                offset
            )

            expect(query).toEqual({
                measures: [VoiceCallMeasure.VoiceCallCount],
                dimensions: voiceCallListDimensions,
                filters: [
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                ],
                timezone,
                segments: segment ? [segment] : [],
                offset,
                limit,
                order: [[VoiceCallDimension.CreatedAt, OrderDirection.Desc]],
            })
        }
    )

    it('voiceCallTotalTalkTimeQueryFactory should create a query', () => {
        const query = voiceCallAverageTalkTimeQueryFactory(statsFilters, 'UTC')

        expect(query).toEqual({
            measures: [VoiceCallMeasure.VoiceCallAverageTalkTime],
            dimensions: [],
            filters: [
                {
                    member: VoiceCallMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: VoiceCallMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone: 'UTC',
            segments: [],
        })
    })

    it('voiceCallAverageWaitTimeQueryFactory should create a query', () => {
        const query = voiceCallAverageWaitTimeQueryFactory(statsFilters, 'UTC')

        expect(query).toEqual({
            measures: [VoiceCallMeasure.VoiceCallAverageWaitTime],
            dimensions: [],
            filters: [
                {
                    member: VoiceCallMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: VoiceCallMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone: 'UTC',
            segments: [VoiceCallSegment.inboundCalls],
        })
    })

    it.each([
        voiceCallAverageTalkTimeQueryFactory,
        voiceCallAverageWaitTimeQueryFactory,
    ])(
        'should limit period to after MIN_DATE_FOR_ADVANCED_VOICE_STATS',
        (factory) => {
            const periodStart = formatReportingQueryDate(moment('2023-12-01'))
            const periodEnd = formatReportingQueryDate(moment('2023-12-28'))
            const statsFilters: StatsFilters = {
                period: {
                    end_datetime: periodEnd,
                    start_datetime: periodStart,
                },
            }
            const query = factory(statsFilters, 'UTC')
            expect(query.filters).toEqual([
                {
                    member: VoiceCallMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [
                        formatReportingQueryDate(
                            moment(MIN_DATE_FOR_ADVANCED_VOICE_STATS)
                        ),
                    ],
                },
                {
                    member: VoiceCallMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [
                        formatReportingQueryDate(
                            moment(MIN_DATE_FOR_ADVANCED_VOICE_STATS)
                        ),
                    ],
                },
            ])
        }
    )

    it.each([
        voiceCallCountQueryFactory,
        voiceCallAverageTalkTimeQueryFactory,
        voiceCallAverageWaitTimeQueryFactory,
        voiceCallCountPerFilteringAgentQueryFactory,
        voiceCallCountPerAgentQueryFactory,
        voiceCallListQueryFactory,
        voiceCallAverageTalkTimePerAgentQueryFactory,
        connectedCallsListQueryFactory,
        waitingTimeCallsListQueryFactory,
    ])(
        'should append ticket period filters when requesting tags',
        (factory) => {
            const statsFilters: StatsFilters = {
                period: {
                    end_datetime: periodEnd,
                    start_datetime: periodStart,
                },
                tags: [1, 2],
            }
            const query = factory(statsFilters, 'UTC')
            expect(query.filters).toEqual(
                expect.arrayContaining([
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                    {
                        member: TicketMember.Tags,
                        operator: ReportingFilterOperator.Equals,
                        values: ['1', '2'],
                    },
                    {
                        member: TicketMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: TicketMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                ])
            )
        }
    )

    it.each([undefined, VoiceCallSegment.inboundCalls])(
        'voiceCallCountPerFilteringAgentQueryFactory should create a query',
        (segment) => {
            const query = voiceCallCountPerFilteringAgentQueryFactory(
                statsFilters,
                timezone,
                segment
            )
            expect(query).toEqual({
                dimensions: [VoiceCallDimension.FilteringAgentId],
                measures: [VoiceCallMeasure.VoiceCallCount],
                segments: segment ? [segment] : [],
                timezone,
                filters: [
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                ],
            })
        }
    )

    it.each([undefined, VoiceCallSegment.inboundCalls])(
        'voiceCallCountPerAgentQueryFactory should create a query',
        (segment) => {
            const query = voiceCallCountPerAgentQueryFactory(
                statsFilters,
                timezone,
                segment
            )
            expect(query).toEqual({
                dimensions: [VoiceCallDimension.AgentId],
                measures: [VoiceCallMeasure.VoiceCallCount],
                segments: segment ? [segment] : [],
                timezone,
                filters: [
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                ],
            })
        }
    )

    it.each([undefined, VoiceCallSegment.inboundCalls])(
        'voiceCallAverageTalkTimePerAgentQueryFactory should create a query',
        (segment) => {
            const query = voiceCallAverageTalkTimePerAgentQueryFactory(
                statsFilters,
                timezone,
                segment
            )
            expect(query).toEqual({
                dimensions: [VoiceCallDimension.AgentId],
                measures: [VoiceCallMeasure.VoiceCallAverageTalkTime],
                segments: segment ? [segment] : [],
                timezone,
                filters: [
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                ],
            })
        }
    )

    it('connectedCallsListQueryFactory should create a query', () => {
        const query = connectedCallsListQueryFactory(statsFilters, timezone)

        expect(query).toEqual({
            measures: [VoiceCallMeasure.VoiceCallCount],
            dimensions: voiceCallListDimensions,
            timezone,
            filters: [
                {
                    member: VoiceCallMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: VoiceCallMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
                {
                    member: VoiceCallMember.TalkTime,
                    operator: ReportingFilterOperator.Set,
                    values: [],
                },
            ],
        })
    })

    it.each([undefined, VoiceCallSegment.inboundCalls])(
        'waitingTimeCallsListQueryFactory should create a query',
        (segment) => {
            const query = waitingTimeCallsListQueryFactory(
                statsFilters,
                timezone,
                segment
            )
            expect(query).toEqual({
                dimensions: voiceCallListDimensions,
                measures: [VoiceCallMeasure.VoiceCallCount],
                timezone,
                filters: [
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                    {
                        member: VoiceCallMember.WaitTime,
                        operator: ReportingFilterOperator.Set,
                        values: [],
                    },
                ],
                segments: segment ? [segment] : [],
            })
        }
    )

    describe('liveDashboardConnectedCallsListQueryFactory', () => {
        it('should create a query', () => {
            window.GORGIAS_STATE = {
                currentAccount: {
                    settings: [
                        {
                            type: AccountSettingType.BusinessHours,
                            data: {},
                        },
                    ],
                },
            } as any

            const query =
                liveDashboardConnectedCallsListQueryFactory(statsFilters)

            expect(query).toEqual({
                measures: [VoiceCallMeasure.VoiceCallCount],
                dimensions: voiceCallListDimensions,
                timezone: 'UTC',
                filters: [
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                    {
                        member: VoiceCallMember.TalkTime,
                        operator: ReportingFilterOperator.Set,
                        values: [],
                    },
                ],
            })
        })

        it('should use the account timezone if it is set', () => {
            window.GORGIAS_STATE = {
                currentAccount: {
                    settings: [
                        {
                            type: AccountSettingType.BusinessHours,
                            data: {
                                timezone: 'Europe/Paris',
                            },
                        },
                    ],
                },
            } as any
            const query =
                liveDashboardConnectedCallsListQueryFactory(statsFilters)

            expect(query.timezone).toEqual('Europe/Paris')
        })
    })

    describe('liveDashboardWaitingTimeCallsListQueryFactory', () => {
        it('should create a query', () => {
            window.GORGIAS_STATE = {
                currentAccount: {
                    settings: [
                        {
                            type: AccountSettingType.BusinessHours,
                            data: {},
                        },
                    ],
                },
            } as any

            const query =
                liveDashboardWaitingTimeCallsListQueryFactory(statsFilters)

            expect(query).toEqual({
                dimensions: voiceCallListDimensions,
                measures: [VoiceCallMeasure.VoiceCallCount],
                timezone: 'UTC',
                filters: [
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                    {
                        member: VoiceCallMember.WaitTime,
                        operator: ReportingFilterOperator.Set,
                        values: [],
                    },
                ],
                segments: [],
            })
        })

        it('should use the account timezone if it is set', () => {
            window.GORGIAS_STATE = {
                currentAccount: {
                    settings: [
                        {
                            type: AccountSettingType.BusinessHours,
                            data: {
                                timezone: 'Europe/Paris',
                            },
                        },
                    ],
                },
            } as any
            const query =
                liveDashboardWaitingTimeCallsListQueryFactory(statsFilters)

            expect(query.timezone).toEqual('Europe/Paris')
        })
    })

    describe('liveDashBoardVoiceCallListQueryFactory', () => {
        it('should create a query', () => {
            window.GORGIAS_STATE = {
                currentAccount: {
                    settings: [
                        {
                            type: AccountSettingType.BusinessHours,
                            data: {},
                        },
                    ],
                },
            } as any

            const query = liveDashBoardVoiceCallListQueryFactory(
                statsFilters,
                VoiceCallSegment.inboundCalls
            )

            expect(query).toEqual({
                measures: [VoiceCallMeasure.VoiceCallCount],
                dimensions: voiceCallListDimensions,
                timezone: 'UTC',
                filters: [
                    {
                        member: VoiceCallMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: VoiceCallMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                ],
                segments: [VoiceCallSegment.inboundCalls],
                limit: undefined,
                offset: undefined,
                order: [[VoiceCallDimension.CreatedAt, OrderDirection.Desc]],
            })
        })

        it('should use the account timezone if it is set', () => {
            window.GORGIAS_STATE = {
                currentAccount: {
                    settings: [
                        {
                            type: AccountSettingType.BusinessHours,
                            data: {
                                timezone: 'Europe/Paris',
                            },
                        },
                    ],
                },
            } as any
            const query = liveDashBoardVoiceCallListQueryFactory(
                statsFilters,
                VoiceCallSegment.inboundCalls
            )

            expect(query.timezone).toEqual('Europe/Paris')
        })
    })
})
