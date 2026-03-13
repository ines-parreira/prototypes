import { assumeMock } from '@repo/testing'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    VoiceCallDimension,
    VoiceCallSegment,
} from 'domains/reporting/models/cubes/VoiceCallCube'
import { getAccountBusinessHoursTimezone } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import type { VoiceCallsContext } from 'domains/reporting/models/scopes/voiceCalls'
import {
    mapVoiceCallDirectionToScopeOrder,
    voiceCallsAchievedExposures,
    voiceCallsAchievedExposuresQueryFactoryV2,
    voiceCallsAverageTalkTime,
    voiceCallsAverageTalkTimePerAgent,
    voiceCallsAverageTalkTimePerAgentQueryFactoryV2,
    voiceCallsAverageTalkTimeQueryFactoryV2,
    voiceCallsAverageWaitTime,
    voiceCallsAverageWaitTimeQueryFactoryV2,
    voiceCallsCount,
    voiceCallsCountAllDimensions,
    voiceCallsCountAllDimensionsQueryFactoryV2,
    voiceCallsCountPerFilteringAgent,
    voiceCallsCountPerFilteringAgentQueryFactoryV2,
    voiceCallsCountQueryFactoryV2,
    voiceCallsLiveDashboardConnectedAllDimensionsQueryFactoryV2,
    voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2,
    voiceCallsSlaAchievementRate,
    voiceCallsSlaAchievementRateQueryFactoryV2,
    voiceCallsWithSlaStatusAllDimensions,
    voiceCallsWithSlaStatusAllDimensionsQueryFactoryV2,
    voiceConnectedAllDimensions,
    voiceConnectedAllDimensionsQueryFactoryV2,
    voiceLiveDashboardWaitTimeCallsAllDimensionsQueryFactoryV2,
    voiceWaitTimeCallsAllDimensions,
    voiceWaitTimeCallsAllDimensionsQueryFactoryV2,
} from 'domains/reporting/models/scopes/voiceCalls'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getLiveVoicePeriodFilter } from 'domains/reporting/pages/voice/components/LiveVoice/utils'

jest.mock('domains/reporting/models/queryFactories/voice/voiceCall', () => ({
    ...jest.requireActual(
        'domains/reporting/models/queryFactories/voice/voiceCall',
    ),
    getAccountBusinessHoursTimezone: jest.fn(),
}))

jest.mock('domains/reporting/pages/voice/components/LiveVoice/utils', () => ({
    ...jest.requireActual(
        'domains/reporting/pages/voice/components/LiveVoice/utils',
    ),
    getLiveVoicePeriodFilter: jest.fn(),
}))

const getAccountBusinessHoursTimezoneMock = assumeMock(
    getAccountBusinessHoursTimezone,
)
const getLiveVoicePeriodFilterMock = assumeMock(getLiveVoicePeriodFilter)

describe('voiceCallsScope', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }

    const timezone = 'utc'

    const context: VoiceCallsContext = {
        filters,
        timezone,
    }

    describe('voiceCallsAverageWaitTime', () => {
        it('creates query with correct metric name and measures', () => {
            const actual = voiceCallsAverageWaitTime.build(context)

            expect(actual).toMatchObject({
                measures: ['averageWaitTimeInSeconds'],
                timezone: 'utc',
                metricName: METRIC_NAMES.VOICE_CALL_AVERAGE_WAIT_TIME,
                scope: MetricScope.VoiceCalls,
            })
        })
    })

    describe('voiceCallsAverageWaitTimeQueryFactoryV2', () => {
        it('returns query with inboundCalls segment', () => {
            const result = voiceCallsAverageWaitTimeQueryFactoryV2(context)

            expect(result.filters).toContainEqual({
                member: 'callDirection',
                operator: 'one-of',
                values: ['inbound'],
            })
        })

        it('includes agentId filter when assignedCallsOnly is true', () => {
            const result = voiceCallsAverageWaitTimeQueryFactoryV2(
                context,
                true,
            )

            expect(result.filters).toContainEqual({
                member: 'agentId',
                operator: 'set',
                values: [],
            })
        })

        it('does not include agentId filter when assignedCallsOnly is false', () => {
            const result = voiceCallsAverageWaitTimeQueryFactoryV2(
                context,
                false,
            )

            const agentIdFilter = result.filters?.find(
                (f: { member: string }) => f.member === 'agentId',
            )
            expect(agentIdFilter).toBeUndefined()
        })
    })

    describe('voiceCallsAverageTalkTime', () => {
        it('creates query with correct metric name and measures', () => {
            const actual = voiceCallsAverageTalkTime.build(context)

            expect(actual).toMatchObject({
                measures: ['averageTalkTimeInSeconds'],
                timezone: 'utc',
                metricName: METRIC_NAMES.VOICE_CALL_AVERAGE_TALK_TIME,
                scope: MetricScope.VoiceCalls,
            })
        })
    })

    describe('voiceCallsAverageTalkTimeQueryFactoryV2', () => {
        it('returns query without segment filters when no segment provided', () => {
            const result = voiceCallsAverageTalkTimeQueryFactoryV2(context)

            expect(result.filters).not.toContainEqual({
                member: 'callDirection',
                operator: 'one-of',
                values: ['inbound'],
            })
        })

        it('includes agentId filter when assignedCallsOnly is true', () => {
            const result = voiceCallsAverageTalkTimeQueryFactoryV2(
                context,
                true,
            )

            expect(result.filters).toContainEqual({
                member: 'agentId',
                operator: 'set',
                values: [],
            })
        })

        it('does not include agentId filter when assignedCallsOnly is false', () => {
            const result = voiceCallsAverageTalkTimeQueryFactoryV2(
                context,
                false,
            )

            const agentIdFilter = result.filters?.find(
                (f: { member: string }) => f.member === 'agentId',
            )
            expect(agentIdFilter).toBeUndefined()
        })
    })

    describe('voiceCallsSlaAchievementRate', () => {
        it('creates query with correct metric name and measures', () => {
            const actual = voiceCallsSlaAchievementRate.build(context)

            expect(actual).toMatchObject({
                measures: ['slaAchievementRate'],
                timezone: 'utc',
                metricName: METRIC_NAMES.VOICE_CALL_SLA_ACHIEVEMENT_RATE,
                scope: MetricScope.VoiceCalls,
            })
        })
    })

    describe('voiceCallsAchievedExposures', () => {
        it('creates query with correct metric name and measures', () => {
            const actual = voiceCallsAchievedExposures.build(context)

            expect(actual).toMatchObject({
                measures: ['achievedExposures'],
                timezone: 'utc',
                metricName: METRIC_NAMES.VOICE_CALL_ACHIEVED_EXPOSURES_TREND,
                scope: MetricScope.VoiceCalls,
            })
        })
    })

    describe('voiceCallsSlaAchievementRateQueryFactoryV2', () => {
        it('returns query with inboundCalls segment', () => {
            const result = voiceCallsSlaAchievementRateQueryFactoryV2(context)

            expect(result.filters).toContainEqual({
                member: 'callDirection',
                operator: 'one-of',
                values: ['inbound'],
            })
        })

        it('includes agentId filter when assignedCallsOnly is true', () => {
            const result = voiceCallsSlaAchievementRateQueryFactoryV2(
                context,
                true,
            )

            expect(result.filters).toContainEqual({
                member: 'agentId',
                operator: 'set',
                values: [],
            })
        })

        it('does not include agentId filter when assignedCallsOnly is false', () => {
            const result = voiceCallsSlaAchievementRateQueryFactoryV2(
                context,
                false,
            )

            const agentIdFilter = result.filters?.find(
                (f: { member: string }) => f.member === 'agentId',
            )
            expect(agentIdFilter).toBeUndefined()
        })
    })

    describe('voiceCallsAchievedExposuresQueryFactoryV2', () => {
        it('returns query without segment filters when no segment provided', () => {
            const result = voiceCallsAchievedExposuresQueryFactoryV2(context)

            const callDirectionFilter = result.filters?.find(
                (f: { member: string }) => f.member === 'callDirection',
            )
            expect(callDirectionFilter).toBeUndefined()
        })

        it('includes agentId filter when assignedCallsOnly is true', () => {
            const result = voiceCallsAchievedExposuresQueryFactoryV2(
                context,
                undefined,
                true,
            )

            expect(result.filters).toContainEqual({
                member: 'agentId',
                operator: 'set',
                values: [],
            })
        })

        it('does not include agentId filter when assignedCallsOnly is false', () => {
            const result = voiceCallsAchievedExposuresQueryFactoryV2(
                context,
                undefined,
                false,
            )

            const agentIdFilter = result.filters?.find(
                (f: { member: string }) => f.member === 'agentId',
            )
            expect(agentIdFilter).toBeUndefined()
        })

        it('applies segment filters when segment is provided', () => {
            const result = voiceCallsAchievedExposuresQueryFactoryV2(
                context,
                VoiceCallSegment.inboundCalls,
            )

            expect(result.filters).toContainEqual({
                member: 'callDirection',
                operator: 'one-of',
                values: ['inbound'],
            })
        })
    })

    describe('voiceCallsCount', () => {
        it('creates query with correct metric name and measures', () => {
            const actual = voiceCallsCount.build(context)

            expect(actual).toMatchObject({
                measures: ['voiceCallsCount'],
                timezone: 'utc',
                metricName: METRIC_NAMES.VOICE_CALL_COUNT_TREND,
                scope: MetricScope.VoiceCalls,
            })
        })
    })

    describe('voiceCallsCountQueryFactoryV2', () => {
        it('returns query without segment filters when no segment provided', () => {
            const result = voiceCallsCountQueryFactoryV2(context)

            const callDirectionFilter = result.filters?.find(
                (f: { member: string }) => f.member === 'callDirection',
            )
            expect(callDirectionFilter).toBeUndefined()
        })

        it('includes agentId filter when assignedCallsOnly is true', () => {
            const result = voiceCallsCountQueryFactoryV2(
                context,
                undefined,
                true,
            )

            expect(result.filters).toContainEqual({
                member: 'agentId',
                operator: 'set',
                values: [],
            })
        })

        describe('withVoiceCallSegment', () => {
            it('adds outbound direction filter for outboundCalls segment', () => {
                const result = voiceCallsCountQueryFactoryV2(
                    context,
                    VoiceCallSegment.outboundCalls,
                )

                expect(result.filters).toContainEqual({
                    member: 'callDirection',
                    operator: 'one-of',
                    values: ['outbound'],
                })
            })

            it('adds inbound direction filter for inboundCalls segment', () => {
                const result = voiceCallsCountQueryFactoryV2(
                    context,
                    VoiceCallSegment.inboundCalls,
                )

                expect(result.filters).toContainEqual({
                    member: 'callDirection',
                    operator: 'one-of',
                    values: ['inbound'],
                })
            })

            it('adds inbound direction and termination status filters for inboundUnansweredCalls segment', () => {
                const result = voiceCallsCountQueryFactoryV2(
                    context,
                    VoiceCallSegment.inboundUnansweredCalls,
                )

                expect(result.filters).toContainEqual({
                    member: 'callDirection',
                    operator: 'one-of',
                    values: ['inbound'],
                })
                expect(result.filters).toContainEqual({
                    member: 'callTerminationStatus',
                    operator: 'one-of',
                    values: [
                        'missed',
                        'abandoned',
                        'cancelled',
                        'callback-requested',
                    ],
                })
            })

            it('adds inbound direction and missed status for inboundMissedCalls segment', () => {
                const result = voiceCallsCountQueryFactoryV2(
                    context,
                    VoiceCallSegment.inboundMissedCalls,
                )

                expect(result.filters).toContainEqual({
                    member: 'callDirection',
                    operator: 'one-of',
                    values: ['inbound'],
                })
                expect(result.filters).toContainEqual({
                    member: 'callTerminationStatus',
                    operator: 'one-of',
                    values: ['missed'],
                })
            })

            it('adds inbound direction and abandoned status for inboundAbandonedCalls segment', () => {
                const result = voiceCallsCountQueryFactoryV2(
                    context,
                    VoiceCallSegment.inboundAbandonedCalls,
                )

                expect(result.filters).toContainEqual({
                    member: 'callDirection',
                    operator: 'one-of',
                    values: ['inbound'],
                })
                expect(result.filters).toContainEqual({
                    member: 'callTerminationStatus',
                    operator: 'one-of',
                    values: ['abandoned'],
                })
            })

            it('adds inbound direction and cancelled status for inboundCancelledCalls segment', () => {
                const result = voiceCallsCountQueryFactoryV2(
                    context,
                    VoiceCallSegment.inboundCancelledCalls,
                )

                expect(result.filters).toContainEqual({
                    member: 'callDirection',
                    operator: 'one-of',
                    values: ['inbound'],
                })
                expect(result.filters).toContainEqual({
                    member: 'callTerminationStatus',
                    operator: 'one-of',
                    values: ['cancelled'],
                })
            })

            it('adds inbound direction and callback-requested status for inboundCallbackRequestedCalls segment', () => {
                const result = voiceCallsCountQueryFactoryV2(
                    context,
                    VoiceCallSegment.inboundCallbackRequestedCalls,
                )

                expect(result.filters).toContainEqual({
                    member: 'callDirection',
                    operator: 'one-of',
                    values: ['inbound'],
                })
                expect(result.filters).toContainEqual({
                    member: 'callTerminationStatus',
                    operator: 'one-of',
                    values: ['callback-requested'],
                })
            })

            it('adds inbound direction and isAnsweredByAgent=false for inboundUnansweredCallsByAgent segment', () => {
                const result = voiceCallsCountQueryFactoryV2(
                    context,
                    VoiceCallSegment.inboundUnansweredCallsByAgent,
                )

                expect(result.filters).toContainEqual({
                    member: 'callDirection',
                    operator: 'one-of',
                    values: ['inbound'],
                })
                expect(result.filters).toContainEqual({
                    member: 'isAnsweredByAgent',
                    operator: 'one-of',
                    values: [false],
                })
            })

            it('adds inbound direction and isAnsweredByAgent=true for inboundAnsweredCallsByAgent segment', () => {
                const result = voiceCallsCountQueryFactoryV2(
                    context,
                    VoiceCallSegment.inboundAnsweredCallsByAgent,
                )

                expect(result.filters).toContainEqual({
                    member: 'callDirection',
                    operator: 'one-of',
                    values: ['inbound'],
                })
                expect(result.filters).toContainEqual({
                    member: 'isAnsweredByAgent',
                    operator: 'one-of',
                    values: [true],
                })
            })

            it('adds inbound callSlaStatus=1 for callSlaBreached segment', () => {
                const result = voiceCallsCountQueryFactoryV2(
                    context,
                    VoiceCallSegment.callSlaBreached,
                )

                expect(result.filters).toContainEqual({
                    member: 'callSlaStatus',
                    operator: 'one-of',
                    values: ['1'],
                })
            })

            it('does not add extra filters for callsInFinalStatus segment', () => {
                const result = voiceCallsCountQueryFactoryV2(
                    context,
                    VoiceCallSegment.callsInFinalStatus,
                )

                const callDirectionFilter = result.filters?.find(
                    (f: { member: string }) => f.member === 'callDirection',
                )
                const callTerminationStatusFilter = result.filters?.find(
                    (f: { member: string }) =>
                        f.member === 'callTerminationStatus',
                )
                const isAnsweredByAgentFilter = result.filters?.find(
                    (f: { member: string }) => f.member === 'isAnsweredByAgent',
                )

                expect(callDirectionFilter).toBeUndefined()
                expect(callTerminationStatusFilter).toBeUndefined()
                expect(isAnsweredByAgentFilter).toBeUndefined()
            })
        })
    })

    describe('voiceCallsList', () => {
        it('creates query with correct metric name, measures and dimensions', () => {
            const actual = voiceCallsCountAllDimensions.build(context)

            expect(actual).toMatchObject({
                measures: ['voiceCallsCount'],
                dimensions: [
                    'agentId',
                    'customerId',
                    'callDirection',
                    'callSlaStatus',
                    'integrationId',
                    'createdDatetime',
                    'status',
                    'duration',
                    'ticketId',
                    'source',
                    'destination',
                    'talkTime',
                    'waitTime',
                    'voicemailAvailable',
                    'voicemailUrl',
                    'callRecordingAvailable',
                    'callRecordingUrl',
                    'displayStatus',
                    'queueId',
                    'queueName',
                    'isPossibleSpam',
                ],
                timezone: 'utc',
                metricName: METRIC_NAMES.VOICE_CALL_LIST,
                scope: MetricScope.VoiceCalls,
            })
        })
    })

    describe('voiceCallsCountAllDimensionsQueryFactoryV2', () => {
        it('returns query with all dimensions', () => {
            const result = voiceCallsCountAllDimensionsQueryFactoryV2(context)

            expect(result.dimensions).toContain('agentId')
            expect(result.dimensions).toContain('customerId')
            expect(result.dimensions).toContain('callDirection')
        })

        it('applies segment filters when segment is provided', () => {
            const result = voiceCallsCountAllDimensionsQueryFactoryV2(
                context,
                VoiceCallSegment.inboundCalls,
            )

            expect(result.filters).toContainEqual({
                member: 'callDirection',
                operator: 'one-of',
                values: ['inbound'],
            })
        })
    })

    describe('voiceCallsCountPerFilteringAgent', () => {
        it('creates query with correct metric name, measures and dimensions', () => {
            const actual = voiceCallsCountPerFilteringAgent.build(context)

            expect(actual).toMatchObject({
                measures: ['voiceCallsCount'],
                dimensions: ['filteringAgentId'],
                timezone: 'utc',
                metricName: METRIC_NAMES.VOICE_CALL_COUNT_PER_FILTERING_AGENT,
                scope: MetricScope.VoiceCalls,
            })
        })
    })

    describe('voiceCallsCountPerFilteringAgentQueryFactoryV2', () => {
        it('returns query with filteringAgentId dimension', () => {
            const result =
                voiceCallsCountPerFilteringAgentQueryFactoryV2(context)

            expect(result.dimensions).toContain('filteringAgentId')
        })

        it('applies segment filters when segment is provided', () => {
            const result = voiceCallsCountPerFilteringAgentQueryFactoryV2(
                context,
                VoiceCallSegment.outboundCalls,
            )

            expect(result.filters).toContainEqual({
                member: 'callDirection',
                operator: 'one-of',
                values: ['outbound'],
            })
        })
    })

    describe('period filters with MIN_DATE_FOR_ADVANCED_VOICE_STATS', () => {
        it('adjusts start_datetime when before min date', () => {
            const oldContext: VoiceCallsContext = {
                filters: {
                    period: {
                        start_datetime: '2023-01-01T00:00:00.000',
                        end_datetime: '2025-09-03T23:59:59.000',
                    },
                },
                timezone: 'utc',
            }

            const result = voiceCallsCountQueryFactoryV2(oldContext)

            expect(result.filters).toContainEqual({
                member: 'periodStart',
                operator: 'afterDate',
                values: ['2024-01-01T00:00:00.000'],
            })
        })

        it('adjusts end_datetime when before min date', () => {
            const oldContext: VoiceCallsContext = {
                filters: {
                    period: {
                        start_datetime: '2023-01-01T00:00:00.000',
                        end_datetime: '2023-06-01T23:59:59.000',
                    },
                },
                timezone: 'utc',
            }

            const result = voiceCallsCountQueryFactoryV2(oldContext)

            expect(result.filters).toContainEqual({
                member: 'periodEnd',
                operator: 'beforeDate',
                values: ['2024-01-01T00:00:00.000'],
            })
        })
    })

    describe('mapVoiceCallDirectionToScopeOrder', () => {
        it('returns undefined when order is undefined', () => {
            const result = mapVoiceCallDirectionToScopeOrder(undefined)

            expect(result).toBeUndefined()
        })

        it('maps CreatedAt dimension to createdDatetime', () => {
            const result = mapVoiceCallDirectionToScopeOrder(
                VoiceCallDimension.CreatedAt,
            )

            expect(result).toBe('createdDatetime')
        })

        it('maps Duration dimension to duration', () => {
            const result = mapVoiceCallDirectionToScopeOrder(
                VoiceCallDimension.Duration,
            )

            expect(result).toBe('duration')
        })

        it('maps WaitTime dimension to waitTime', () => {
            const result = mapVoiceCallDirectionToScopeOrder(
                VoiceCallDimension.WaitTime,
            )

            expect(result).toBe('waitTime')
        })

        it('maps DisplayStatus dimension to displayStatus', () => {
            const result = mapVoiceCallDirectionToScopeOrder(
                VoiceCallDimension.DisplayStatus,
            )

            expect(result).toBe('displayStatus')
        })

        it('returns undefined for unmapped dimensions', () => {
            const result = mapVoiceCallDirectionToScopeOrder(
                VoiceCallDimension.AgentId,
            )

            expect(result).toBeUndefined()
        })

        it('returns undefined for unmapped dimensions (CustomerId)', () => {
            const result = mapVoiceCallDirectionToScopeOrder(
                VoiceCallDimension.CustomerId,
            )

            expect(result).toBeUndefined()
        })

        it('returns undefined for unmapped dimensions (Direction)', () => {
            const result = mapVoiceCallDirectionToScopeOrder(
                VoiceCallDimension.Direction,
            )

            expect(result).toBeUndefined()
        })
    })

    describe('voiceCallsAverageTalkTimePerAgent', () => {
        it('creates query with correct metric name, measures and dimensions', () => {
            const actual = voiceCallsAverageTalkTimePerAgent.build(context)

            expect(actual).toMatchObject({
                measures: ['averageTalkTimeInSeconds'],
                dimensions: ['agentId'],
                timezone: 'utc',
                metricName: METRIC_NAMES.VOICE_CALL_AVERAGE_TALK_TIME_PER_AGENT,
                scope: MetricScope.VoiceCalls,
            })
        })
    })

    describe('voiceCallsAverageTalkTimePerAgentQueryFactoryV2', () => {
        it('returns query with agentId dimension', () => {
            const result =
                voiceCallsAverageTalkTimePerAgentQueryFactoryV2(context)

            expect(result.dimensions).toContain('agentId')
        })

        it('applies segment filters when segment is provided', () => {
            const result = voiceCallsAverageTalkTimePerAgentQueryFactoryV2(
                context,
                VoiceCallSegment.outboundCalls,
            )

            expect(result.filters).toContainEqual({
                member: 'callDirection',
                operator: 'one-of',
                values: ['outbound'],
            })
        })

        it('returns query without segment filters when no segment provided', () => {
            const result =
                voiceCallsAverageTalkTimePerAgentQueryFactoryV2(context)

            const callDirectionFilter = result.filters?.find(
                (f: { member: string }) => f.member === 'callDirection',
            )
            expect(callDirectionFilter).toBeUndefined()
        })
    })

    describe('voiceConnectedAllDimensions', () => {
        it('creates query with correct metric name, measures and dimensions', () => {
            const actual = voiceConnectedAllDimensions.build(context)

            expect(actual).toMatchObject({
                measures: ['voiceCallsCount'],
                dimensions: [
                    'agentId',
                    'customerId',
                    'callDirection',
                    'callSlaStatus',
                    'integrationId',
                    'createdDatetime',
                    'status',
                    'duration',
                    'ticketId',
                    'source',
                    'destination',
                    'talkTime',
                    'waitTime',
                    'voicemailAvailable',
                    'voicemailUrl',
                    'callRecordingAvailable',
                    'callRecordingUrl',
                    'displayStatus',
                    'queueId',
                    'queueName',
                    'isPossibleSpam',
                ],
                timezone: 'utc',
                metricName: METRIC_NAMES.VOICE_CONNECTED_CALLS_LIST,
                scope: MetricScope.VoiceCalls,
            })
        })

        it('includes talkTime set filter', () => {
            const actual = voiceConnectedAllDimensions.build(context)

            expect(actual.filters).toContainEqual({
                member: 'talkTime',
                operator: 'set',
                values: [],
            })
        })
    })

    describe('voiceConnectedAllDimensionsQueryFactoryV2', () => {
        it('returns query with all dimensions', () => {
            const result = voiceConnectedAllDimensionsQueryFactoryV2(context)

            expect(result.dimensions).toContain('agentId')
            expect(result.dimensions).toContain('customerId')
            expect(result.dimensions).toContain('callDirection')
        })

        it('includes talkTime set filter', () => {
            const result = voiceConnectedAllDimensionsQueryFactoryV2(context)

            expect(result.filters).toContainEqual({
                member: 'talkTime',
                operator: 'set',
                values: [],
            })
        })
    })

    describe('voiceWaitTimeCallsAllDimensions', () => {
        it('creates query with correct metric name, measures and dimensions', () => {
            const actual = voiceWaitTimeCallsAllDimensions.build(context)

            expect(actual).toMatchObject({
                measures: ['voiceCallsCount'],
                dimensions: [
                    'agentId',
                    'customerId',
                    'callDirection',
                    'callSlaStatus',
                    'integrationId',
                    'createdDatetime',
                    'status',
                    'duration',
                    'ticketId',
                    'source',
                    'destination',
                    'talkTime',
                    'waitTime',
                    'voicemailAvailable',
                    'voicemailUrl',
                    'callRecordingAvailable',
                    'callRecordingUrl',
                    'displayStatus',
                    'queueId',
                    'queueName',
                    'isPossibleSpam',
                ],
                timezone: 'utc',
                metricName: METRIC_NAMES.VOICE_WAITING_TIME_CALLS_LIST,
                scope: MetricScope.VoiceCalls,
            })
        })
    })

    describe('voiceWaitTimeCallsAllDimensionsQueryFactoryV2', () => {
        it('returns query with all dimensions', () => {
            const result =
                voiceWaitTimeCallsAllDimensionsQueryFactoryV2(context)

            expect(result.dimensions).toContain('agentId')
            expect(result.dimensions).toContain('customerId')
        })

        it('applies segment filters when segment is provided', () => {
            const result = voiceWaitTimeCallsAllDimensionsQueryFactoryV2(
                context,
                VoiceCallSegment.inboundCalls,
            )

            expect(result.filters).toContainEqual({
                member: 'callDirection',
                operator: 'one-of',
                values: ['inbound'],
            })
        })
    })

    describe('voiceCallsWithSlaStatusAllDimensions', () => {
        it('creates query with correct metric name, measures and dimensions', () => {
            const actual = voiceCallsWithSlaStatusAllDimensions.build(context)

            expect(actual).toMatchObject({
                measures: ['voiceCallsCount'],
                dimensions: [
                    'agentId',
                    'customerId',
                    'callDirection',
                    'callSlaStatus',
                    'integrationId',
                    'createdDatetime',
                    'status',
                    'duration',
                    'ticketId',
                    'source',
                    'destination',
                    'talkTime',
                    'waitTime',
                    'voicemailAvailable',
                    'voicemailUrl',
                    'callRecordingAvailable',
                    'callRecordingUrl',
                    'displayStatus',
                    'queueId',
                    'queueName',
                    'isPossibleSpam',
                ],
                timezone: 'utc',
                metricName: METRIC_NAMES.VOICE_CALL_WITH_SLA_STATUS_LIST,
                scope: MetricScope.VoiceCalls,
            })
        })

        it('includes callSlaStatus set filter', () => {
            const actual = voiceCallsWithSlaStatusAllDimensions.build(context)

            expect(actual.filters).toContainEqual({
                member: 'callSlaStatus',
                operator: 'set',
                values: [],
            })
        })
    })

    describe('voiceCallsWithSlaStatusAllDimensionsQueryFactoryV2', () => {
        it('applies inboundCalls segment filter', () => {
            const result =
                voiceCallsWithSlaStatusAllDimensionsQueryFactoryV2(context)

            expect(result.filters).toContainEqual({
                member: 'callDirection',
                operator: 'one-of',
                values: ['inbound'],
            })
        })

        it('includes callSlaStatus set filter', () => {
            const result =
                voiceCallsWithSlaStatusAllDimensionsQueryFactoryV2(context)

            expect(result.filters).toContainEqual({
                member: 'callSlaStatus',
                operator: 'set',
                values: [],
            })
        })
    })

    describe('voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2', () => {
        const livePeriod = {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        }
        const liveTimezone = 'Europe/Paris'

        beforeEach(() => {
            getAccountBusinessHoursTimezoneMock.mockReturnValue(liveTimezone)
            getLiveVoicePeriodFilterMock.mockReturnValue(livePeriod)
        })

        it('returns query with all dimensions', () => {
            const result =
                voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2(context)

            expect(result.dimensions).toContain('agentId')
            expect(result.dimensions).toContain('customerId')
            expect(result.dimensions).toContain('callDirection')
        })

        it('uses timezone from getAccountBusinessHoursTimezone', () => {
            const result =
                voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2(context)

            expect(result.timezone).toBe(liveTimezone)
        })

        it('calls getLiveVoicePeriodFilter with the business hours timezone', () => {
            voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2(context)

            expect(getLiveVoicePeriodFilterMock).toHaveBeenCalledWith(
                liveTimezone,
            )
        })

        it('uses live period from getLiveVoicePeriodFilter instead of context period', () => {
            const result =
                voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2(context)

            expect(result.filters).toContainEqual({
                member: 'periodStart',
                operator: 'afterDate',
                values: [livePeriod.start_datetime],
            })
            expect(result.filters).toContainEqual({
                member: 'periodEnd',
                operator: 'beforeDate',
                values: [livePeriod.end_datetime],
            })
        })

        it('does not apply segment filters when no segment provided', () => {
            const result =
                voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2(context)

            const callDirectionFilter = result.filters?.find(
                (f: { member: string }) => f.member === 'callDirection',
            )
            expect(callDirectionFilter).toBeUndefined()
        })

        it('applies inbound segment filter when inboundCalls segment is provided', () => {
            const result =
                voiceCallsLiveDashboardCountAllDimensionsQueryFactoryV2(
                    context,
                    VoiceCallSegment.inboundCalls,
                )

            expect(result.filters).toContainEqual({
                member: 'callDirection',
                operator: 'one-of',
                values: ['inbound'],
            })
        })
    })

    describe('voiceCallsLiveDashboardConnectedAllDimensionsQueryFactoryV2', () => {
        const livePeriod = {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        }
        const liveTimezone = 'Europe/Paris'

        beforeEach(() => {
            getAccountBusinessHoursTimezoneMock.mockReturnValue(liveTimezone)
            getLiveVoicePeriodFilterMock.mockReturnValue(livePeriod)
        })

        it('returns query with all dimensions', () => {
            const result =
                voiceCallsLiveDashboardConnectedAllDimensionsQueryFactoryV2(
                    context,
                )

            expect(result.dimensions).toContain('agentId')
            expect(result.dimensions).toContain('customerId')
            expect(result.dimensions).toContain('callDirection')
        })

        it('uses timezone from getAccountBusinessHoursTimezone', () => {
            const result =
                voiceCallsLiveDashboardConnectedAllDimensionsQueryFactoryV2(
                    context,
                )

            expect(result.timezone).toBe(liveTimezone)
        })

        it('calls getLiveVoicePeriodFilter with the business hours timezone', () => {
            voiceCallsLiveDashboardConnectedAllDimensionsQueryFactoryV2(context)

            expect(getLiveVoicePeriodFilterMock).toHaveBeenCalledWith(
                liveTimezone,
            )
        })

        it('uses live period from getLiveVoicePeriodFilter instead of context period', () => {
            const result =
                voiceCallsLiveDashboardConnectedAllDimensionsQueryFactoryV2(
                    context,
                )

            expect(result.filters).toContainEqual({
                member: 'periodStart',
                operator: 'afterDate',
                values: [livePeriod.start_datetime],
            })
            expect(result.filters).toContainEqual({
                member: 'periodEnd',
                operator: 'beforeDate',
                values: [livePeriod.end_datetime],
            })
        })

        it('includes talkTime set filter', () => {
            const result =
                voiceCallsLiveDashboardConnectedAllDimensionsQueryFactoryV2(
                    context,
                )

            expect(result.filters).toContainEqual({
                member: 'talkTime',
                operator: 'set',
                values: [],
            })
        })
    })

    describe('voiceLiveDashboardWaitTimeCallsAllDimensionsQueryFactoryV2', () => {
        const livePeriod = {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        }
        const liveTimezone = 'Europe/Paris'

        beforeEach(() => {
            getAccountBusinessHoursTimezoneMock.mockReturnValue(liveTimezone)
            getLiveVoicePeriodFilterMock.mockReturnValue(livePeriod)
        })

        it('uses timezone from getAccountBusinessHoursTimezone', () => {
            const result =
                voiceLiveDashboardWaitTimeCallsAllDimensionsQueryFactoryV2(
                    context,
                )

            expect(result.timezone).toBe(liveTimezone)
        })

        it('calls getLiveVoicePeriodFilter with the business hours timezone', () => {
            voiceLiveDashboardWaitTimeCallsAllDimensionsQueryFactoryV2(context)

            expect(getLiveVoicePeriodFilterMock).toHaveBeenCalledWith(
                liveTimezone,
            )
        })

        it('uses live period instead of context period', () => {
            const result =
                voiceLiveDashboardWaitTimeCallsAllDimensionsQueryFactoryV2(
                    context,
                )

            expect(result.filters).toContainEqual({
                member: 'periodStart',
                operator: 'afterDate',
                values: [livePeriod.start_datetime],
            })
            expect(result.filters).toContainEqual({
                member: 'periodEnd',
                operator: 'beforeDate',
                values: [livePeriod.end_datetime],
            })
        })

        it('applies segment filters when segment is provided', () => {
            const result =
                voiceLiveDashboardWaitTimeCallsAllDimensionsQueryFactoryV2(
                    context,
                    VoiceCallSegment.inboundCalls,
                )

            expect(result.filters).toContainEqual({
                member: 'callDirection',
                operator: 'one-of',
                values: ['inbound'],
            })
        })
    })
})
