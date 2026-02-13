import { assumeMock } from '@repo/testing'
import moment from 'moment'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
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
    voiceCallCountPerFilteringAgentQueryFactory,
    voiceCallCountQueryFactory,
    voiceCallListQueryFactory,
    voiceCallListWithSlaStatusQueryFactory,
    voiceCallSlaAchievementRateQueryFactory,
    waitingTimeCallsListQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { getLiveVoicePeriodFilter } from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import { MIN_DATE_FOR_ADVANCED_VOICE_STATS } from 'domains/reporting/pages/voice/constants/voiceOverview'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'
import { VoiceCallDisplayStatus } from 'models/voiceCall/types'
import { AccountSettingType } from 'state/currentAccount/types'

const getLiveVoicePeriodFilterMock = assumeMock(getLiveVoicePeriodFilter)

jest.mock('domains/reporting/pages/voice/components/LiveVoice/utils')

const voiceCallListDimensions = [
    VoiceCallDimension.AgentId,
    VoiceCallDimension.CallSlaStatus,
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
    VoiceCallDimension.DisplayStatus,
    VoiceCallDimension.QueueId,
    VoiceCallDimension.QueueName,
    VoiceCallDimension.IsPossibleSpam,
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
                metricName: METRIC_NAMES.VOICE_CALL_COUNT_TREND,
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
                    metricName: METRIC_NAMES.VOICE_CALL_LIST,
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
                metricName: METRIC_NAMES.VOICE_CALL_LIST,
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
                metricName: METRIC_NAMES.VOICE_CALL_AVERAGE_TALK_TIME,
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
                metricName: METRIC_NAMES.VOICE_CALL_AVERAGE_WAIT_TIME,
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
        'voiceCallSlaAchievementRateQueryFactory should create a query',
        ({ includeLiveData, expectedSegments }) => {
            const query = voiceCallSlaAchievementRateQueryFactory(
                statsFilters,
                'UTC',
                includeLiveData,
            )

            expect(query).toEqual({
                metricName: METRIC_NAMES.VOICE_CALL_SLA_ACHIEVEMENT_RATE,
                measures: [VoiceCallMeasure.SlaAchievementRate],
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
        voiceCallSlaAchievementRateQueryFactory,
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

    describe('voiceCallListWithSlaStatusQueryFactory', () => {
        it.each([
            {
                segment: undefined,
                statusFilters: undefined,
                limit: 10,
                offset: 0,
                includeLiveData: false,
                expectedSegments: [VoiceCallSegment.callsInFinalStatus],
            },
            {
                segment: VoiceCallSegment.inboundCalls,
                statusFilters: [VoiceCallDisplayStatus.Answered],
                limit: 20,
                offset: 10,
                includeLiveData: false,
                expectedSegments: [
                    VoiceCallSegment.inboundCalls,
                    VoiceCallSegment.callsInFinalStatus,
                ],
            },
            {
                segment: VoiceCallSegment.outboundCalls,
                statusFilters: undefined,
                limit: 50,
                offset: 0,
                includeLiveData: true,
                expectedSegments: [VoiceCallSegment.outboundCalls],
            },
        ])(
            'should create a query with SLA status filter',
            ({
                segment,
                statusFilters,
                limit,
                offset,
                includeLiveData,
                expectedSegments,
            }) => {
                const query = voiceCallListWithSlaStatusQueryFactory(
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

                const expectedFilters = [
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
                ]

                if (statusFilters) {
                    expectedFilters.push({
                        member: VoiceCallMember.DisplayStatus,
                        operator: ReportingFilterOperator.Equals,
                        values: statusFilters,
                    })
                }

                expectedFilters.push({
                    member: VoiceCallMember.SlaStatus,
                    operator: ReportingFilterOperator.Set,
                    values: [],
                })

                expect(query).toEqual({
                    metricName: METRIC_NAMES.VOICE_CALL_WITH_SLA_STATUS_LIST,
                    measures: [VoiceCallMeasure.VoiceCallCount],
                    dimensions: voiceCallListDimensions,
                    filters: expectedFilters,
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
            const query = voiceCallListWithSlaStatusQueryFactory(
                statsFilters,
                timezone,
                undefined,
                undefined,
                undefined,
                VoiceCallDimension.WaitTime,
                OrderDirection.Asc,
            )

            expect(query).toEqual({
                metricName: METRIC_NAMES.VOICE_CALL_WITH_SLA_STATUS_LIST,
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
                    {
                        member: VoiceCallMember.SlaStatus,
                        operator: ReportingFilterOperator.Set,
                        values: [],
                    },
                ],
                timezone,
                segments: [VoiceCallSegment.callsInFinalStatus],
                order: [[VoiceCallDimension.WaitTime, OrderDirection.Asc]],
            })
        })
    })

    it.each([
        voiceCallCountQueryFactory,
        voiceCallAverageTalkTimeQueryFactory,
        voiceCallAverageWaitTimeQueryFactory,
        voiceCallSlaAchievementRateQueryFactory,
        voiceCallCountPerFilteringAgentQueryFactory,
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
                metricName: METRIC_NAMES.VOICE_CALL_COUNT_PER_FILTERING_AGENT,
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
        'voiceCallAverageTalkTimePerAgentQueryFactory should create a query',
        ({ segment, expectedSegments }) => {
            const query = voiceCallAverageTalkTimePerAgentQueryFactory(
                statsFilters,
                timezone,
                segment,
            )
            expect(query).toEqual({
                metricName: METRIC_NAMES.VOICE_CALL_AVERAGE_TALK_TIME_PER_AGENT,
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
            metricName: METRIC_NAMES.VOICE_CONNECTED_CALLS_LIST,
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
                metricName: METRIC_NAMES.VOICE_WAITING_TIME_CALLS_LIST,
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

    describe('voiceCallDefaultFilters', () => {
        it.each([undefined, []])(
            'should not add ticket filters if the tags are empty',
            (tags) => {
                const filters = {
                    ...statsFilters,
                    tags,
                }
                const query = voiceCallListQueryFactory(
                    filters,
                    timezone,
                    undefined,
                    10,
                    10,
                    undefined,
                    undefined,
                    [],
                    false,
                )

                expect(query).toEqual({
                    metricName: METRIC_NAMES.VOICE_CALL_LIST,
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
                        {
                            member: VoiceCallMember.DisplayStatus,
                            operator: ReportingFilterOperator.Equals,
                            values: [],
                        },
                    ],
                    timezone,
                    segments: [VoiceCallSegment.callsInFinalStatus],
                    offset: 10,
                    limit: 10,
                    order: [
                        [VoiceCallDimension.CreatedAt, OrderDirection.Desc],
                    ],
                })
            },
        )

        it('should add ticket filters if the tags are not empty', () => {
            const filters = {
                ...statsFilters,
                tags: [
                    {
                        ...withDefaultLogicalOperator([1, 2]),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
            }
            const query = voiceCallListQueryFactory(
                filters,
                timezone,
                undefined,
                10,
                10,
                undefined,
                undefined,
                [],
                false,
            )

            expect(query).toEqual({
                metricName: METRIC_NAMES.VOICE_CALL_LIST,
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
                    {
                        member: VoiceCallMember.DisplayStatus,
                        operator: ReportingFilterOperator.Equals,
                        values: [],
                    },
                ],
                timezone,
                segments: [VoiceCallSegment.callsInFinalStatus],
                offset: 10,
                limit: 10,
                order: [[VoiceCallDimension.CreatedAt, OrderDirection.Desc]],
            })
        })
    })

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
                metricName: METRIC_NAMES.VOICE_CONNECTED_CALLS_LIST,
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
                metricName: METRIC_NAMES.VOICE_WAITING_TIME_CALLS_LIST,
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
                metricName: METRIC_NAMES.VOICE_CALL_LIST,
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
