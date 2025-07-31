import moment from 'moment'

import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import {
    VoiceCallDimension,
    VoiceCallMeasure,
    VoiceCallMember,
    VoiceCallSegment,
} from 'domains/reporting/models/cubes/VoiceCallCube'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
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
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import {
    StatsFilters,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { getLiveVoicePeriodFilter } from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import { MIN_DATE_FOR_ADVANCED_VOICE_STATS } from 'domains/reporting/pages/voice/constants/voiceOverview'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'
import { VoiceCallDisplayStatus } from 'models/voiceCall/types'
import { AccountSettingType } from 'state/currentAccount/types'
import { assumeMock } from 'utils/testing'

const getLiveVoicePeriodFilterMock = assumeMock(getLiveVoicePeriodFilter)

jest.mock('domains/reporting/pages/voice/components/LiveVoice/utils')

const voiceCallListDimensions = [
    VoiceCallDimension.AgentId,
    VoiceCallDimension.CustomerId,
    VoiceCallDimension.Direction,
    VoiceCallDimension.IntegrationId,
    VoiceCallDimension.Store,
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
    VoiceCallDimension.DisplayStatus,
    VoiceCallDimension.QueueId,
    VoiceCallDimension.QueueName,
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
        {
            measures: [VoiceCallMeasure.VoiceCallCount],
            dimensions: [],
            segment: undefined,
            statusFilters: undefined,
            additionalFilters: [],
            includeLiveData: false,
            expectedSegments: [VoiceCallSegment.callsInFinalStatus],
        },
        {
            measures: [VoiceCallMeasure.VoiceCallCount],
            dimensions: [],
            segment: undefined,
            statusFilters: undefined,
            additionalFilters: [],
            includeLiveData: true,
            expectedSegments: [],
        },
        {
            measures: [VoiceCallMeasure.VoiceCallCount],
            dimensions: [],
            segment: VoiceCallSegment.outboundCalls,
            statusFilters: undefined,
            additionalFilters: [],
            includeLiveData: false,
            expectedSegments: [
                VoiceCallSegment.outboundCalls,
                VoiceCallSegment.callsInFinalStatus,
            ],
        },
        {
            measures: [VoiceCallMeasure.VoiceCallCount],
            dimensions: [],
            segment: VoiceCallSegment.outboundCalls,
            statusFilters: [VoiceCallDisplayStatus.Answered],
            additionalFilters: [
                {
                    member: VoiceCallMember.DisplayStatus,
                    operator: ReportingFilterOperator.Equals,
                    values: [VoiceCallDisplayStatus.Answered],
                },
            ],
            includeLiveData: false,
            expectedSegments: [
                VoiceCallSegment.outboundCalls,
                VoiceCallSegment.callsInFinalStatus,
            ],
        },
    ])(
        'voiceCallQueryFactory should create a query',
        ({
            measures,
            dimensions,
            segment,
            statusFilters,
            additionalFilters,
            includeLiveData,
            expectedSegments,
        }) => {
            const query = voiceCallCountQueryFactory(
                statsFilters,
                timezone,
                segment,
                statusFilters,
                includeLiveData,
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
                    ...additionalFilters,
                ],
                timezone,
                segments: expectedSegments,
            })
        },
    )

    describe('voiceCallListQueryFactory', () => {
        it.each([
            {
                segment: VoiceCallSegment.outboundCalls,
                statusFilters: undefined,
                limit: 10,
                offset: 0,
                additionalFilters: [],
                includeLiveData: false,
                expectedSegments: [
                    VoiceCallSegment.outboundCalls,
                    VoiceCallSegment.callsInFinalStatus,
                ],
            },
            {
                segment: VoiceCallSegment.outboundCalls,
                statusFilters: undefined,
                limit: 10,
                offset: 0,
                additionalFilters: [],
                includeLiveData: true,
                expectedSegments: [VoiceCallSegment.outboundCalls],
            },
            {
                segment: undefined,
                statusFilters: [
                    VoiceCallDisplayStatus.Unanswered,
                    VoiceCallDisplayStatus.Failed,
                ],
                limit: 10,
                offset: 10,
                additionalFilters: [
                    {
                        member: VoiceCallMember.DisplayStatus,
                        operator: ReportingFilterOperator.Equals,
                        values: [
                            VoiceCallDisplayStatus.Unanswered,
                            VoiceCallDisplayStatus.Failed,
                        ],
                    },
                ],
                includeLiveData: false,
                expectedSegments: [VoiceCallSegment.callsInFinalStatus],
            },
        ])(
            'voiceCallListQueryFactory should create a query',
            ({
                segment,
                statusFilters,
                limit,
                offset,
                additionalFilters,
                includeLiveData,
                expectedSegments,
            }) => {
                const query = voiceCallListQueryFactory(
                    statsFilters,
                    timezone,
                    segment,
                    limit,
                    offset,
                    undefined,
                    undefined,
                    statusFilters,
                    includeLiveData,
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
                        ...additionalFilters,
                    ],
                    timezone,
                    segments: expectedSegments,
                    offset,
                    limit,
                    order: [
                        [VoiceCallDimension.CreatedAt, OrderDirection.Desc],
                    ],
                })
            },
        )

        it('should create query with custom order and sorting', () => {
            const query = voiceCallListQueryFactory(
                statsFilters,
                timezone,
                undefined,
                undefined,
                undefined,
                VoiceCallDimension.Duration,
                OrderDirection.Desc,
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
                segments: [VoiceCallSegment.callsInFinalStatus],
                order: [[VoiceCallDimension.Duration, OrderDirection.Desc]],
            })
        })
    })

    it.each([
        {
            includeLiveData: false,
            expectedSegments: [VoiceCallSegment.callsInFinalStatus],
        },
        {
            includeLiveData: true,
            expectedSegments: [],
        },
    ])(
        'voiceCallTotalTalkTimeQueryFactory should create a query',
        ({ includeLiveData, expectedSegments }) => {
            const query = voiceCallAverageTalkTimeQueryFactory(
                statsFilters,
                'UTC',
                includeLiveData,
            )

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
                segments: expectedSegments,
            })
        },
    )

    it.each([
        {
            includeLiveData: false,
            expectedSegments: [
                VoiceCallSegment.inboundCalls,
                VoiceCallSegment.callsInFinalStatus,
            ],
        },
        {
            includeLiveData: true,
            expectedSegments: [VoiceCallSegment.inboundCalls],
        },
    ])(
        'voiceCallAverageWaitTimeQueryFactory should create a query',
        ({ includeLiveData, expectedSegments }) => {
            const query = voiceCallAverageWaitTimeQueryFactory(
                statsFilters,
                'UTC',
                includeLiveData,
            )

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
                segments: expectedSegments,
            })
        },
    )

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
                            moment(MIN_DATE_FOR_ADVANCED_VOICE_STATS),
                        ),
                    ],
                },
                {
                    member: VoiceCallMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [
                        formatReportingQueryDate(
                            moment(MIN_DATE_FOR_ADVANCED_VOICE_STATS),
                        ),
                    ],
                },
            ])
        },
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
                tags: [
                    {
                        ...withDefaultLogicalOperator([1, 2]),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
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
                ]),
            )
        },
    )

    it.each([
        {
            segment: undefined,
            expectedSegments: [VoiceCallSegment.callsInFinalStatus],
        },
        {
            segment: VoiceCallSegment.inboundCalls,
            expectedSegments: [
                VoiceCallSegment.inboundCalls,
                VoiceCallSegment.callsInFinalStatus,
            ],
        },
    ])(
        'voiceCallCountPerFilteringAgentQueryFactory should create a query',
        ({ segment, expectedSegments }) => {
            const query = voiceCallCountPerFilteringAgentQueryFactory(
                statsFilters,
                timezone,
                segment,
            )
            expect(query).toEqual({
                dimensions: [VoiceCallDimension.FilteringAgentId],
                measures: [VoiceCallMeasure.VoiceCallCount],
                segments: expectedSegments,
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
        },
    )

    it.each([
        {
            segment: undefined,
            expectedSegments: [VoiceCallSegment.callsInFinalStatus],
        },
        {
            segment: VoiceCallSegment.inboundCalls,
            expectedSegments: [
                VoiceCallSegment.inboundCalls,
                VoiceCallSegment.callsInFinalStatus,
            ],
        },
    ])(
        'voiceCallCountPerAgentQueryFactory should create a query',
        ({ segment, expectedSegments }) => {
            const query = voiceCallCountPerAgentQueryFactory(
                statsFilters,
                timezone,
                segment,
            )
            expect(query).toEqual({
                dimensions: [VoiceCallDimension.AgentId],
                measures: [VoiceCallMeasure.VoiceCallCount],
                segments: expectedSegments,
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
        },
    )

    it.each([
        {
            segment: undefined,
            expectedSegments: [VoiceCallSegment.callsInFinalStatus],
        },
        {
            segment: VoiceCallSegment.inboundCalls,
            expectedSegments: [
                VoiceCallSegment.inboundCalls,
                VoiceCallSegment.callsInFinalStatus,
            ],
        },
    ])(
        'voiceCallAverageTalkTimePerAgentQueryFactory should create a query',
        ({ segment, expectedSegments }) => {
            const query = voiceCallAverageTalkTimePerAgentQueryFactory(
                statsFilters,
                timezone,
                segment,
            )
            expect(query).toEqual({
                dimensions: [VoiceCallDimension.AgentId],
                measures: [VoiceCallMeasure.VoiceCallAverageTalkTime],
                segments: expectedSegments,
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
        },
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
            order: [['VoiceCall.createdAt', 'desc']],
        })
    })

    it.each([
        {
            segment: undefined,
            expectedSegments: [VoiceCallSegment.callsInFinalStatus],
        },
        {
            segment: VoiceCallSegment.inboundCalls,
            expectedSegments: [
                VoiceCallSegment.inboundCalls,
                VoiceCallSegment.callsInFinalStatus,
            ],
        },
    ])(
        'waitingTimeCallsListQueryFactory should create a query',
        ({ segment, expectedSegments }) => {
            const query = waitingTimeCallsListQueryFactory(
                statsFilters,
                timezone,
                segment,
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
                segments: expectedSegments,
                order: [['VoiceCall.createdAt', 'desc']],
            })
        },
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
                order: [['VoiceCall.createdAt', 'desc']],
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
                order: [['VoiceCall.createdAt', 'desc']],
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
                VoiceCallSegment.inboundCalls,
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
                VoiceCallSegment.inboundCalls,
            )

            expect(query.timezone).toEqual('Europe/Paris')
        })
    })
})
