import moment from 'moment'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import { VoiceCallDimension } from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    VoiceEventsByAgentDimension,
    VoiceEventsByAgentMeasure,
    VoiceEventsByAgentMember,
    VoiceEventsByAgentSegment,
} from 'domains/reporting/models/cubes/VoiceEventsByAgent'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    declinedVoiceCallsCountPerAgentQueryFactory,
    declinedVoiceCallsCountQueryFactory,
    declinedVoiceCallsPerAgentQueryFactory,
    transferredInboundVoiceCallsCountPerAgentQueryFactory,
    transferredInboundVoiceCallsCountQueryFactory,
    transferredInboundVoiceCallsPerAgentQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceEventsByAgent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('voice events by agent factories', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }

    it('declinedVoiceCallsCountPerAgentQueryFactory should create a query', () => {
        const query = declinedVoiceCallsCountPerAgentQueryFactory(
            statsFilters,
            'UTC',
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.VOICE_DECLINED_CALLS_COUNT_PER_AGENT,
            measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
            dimensions: [VoiceEventsByAgentDimension.AgentId],
            filters: [
                {
                    member: VoiceEventsByAgentMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: VoiceEventsByAgentMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone: 'UTC',
            segments: [
                VoiceEventsByAgentSegment.declinedCalls,
                VoiceEventsByAgentSegment.callsInFinalStatus,
            ],
        })
    })

    it('declinedVoiceCallsCountPerAgentQueryFactory should create a query with sorting', () => {
        const query = declinedVoiceCallsCountPerAgentQueryFactory(
            statsFilters,
            'UTC',
            OrderDirection.Asc,
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.VOICE_DECLINED_CALLS_COUNT_PER_AGENT,
            measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
            dimensions: [VoiceEventsByAgentDimension.AgentId],
            filters: [
                {
                    member: VoiceEventsByAgentMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: VoiceEventsByAgentMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone: 'UTC',
            segments: [
                VoiceEventsByAgentSegment.declinedCalls,
                VoiceEventsByAgentSegment.callsInFinalStatus,
            ],
            order: [
                [
                    VoiceEventsByAgentMeasure.VoiceEventsCount,
                    OrderDirection.Asc,
                ],
            ],
        })
    })

    it('declinedVoiceCallsCountQueryFactory should create a query', () => {
        const query = declinedVoiceCallsCountQueryFactory(statsFilters, 'UTC')

        expect(query).toEqual({
            metricName: METRIC_NAMES.VOICE_DECLINED_CALLS_COUNT,
            measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
            dimensions: [],
            filters: [
                {
                    member: VoiceEventsByAgentMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: VoiceEventsByAgentMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone: 'UTC',
            segments: [
                VoiceEventsByAgentSegment.declinedCalls,
                VoiceEventsByAgentSegment.callsInFinalStatus,
            ],
        })
    })

    it('transferredInboundVoiceCallsCountPerAgentQueryFactory should create a query', () => {
        const query = transferredInboundVoiceCallsCountPerAgentQueryFactory(
            statsFilters,
            'UTC',
        )

        expect(query).toEqual({
            metricName:
                METRIC_NAMES.VOICE_TRANSFERRED_INBOUND_CALLS_COUNT_PER_AGENT,
            measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
            dimensions: [VoiceEventsByAgentDimension.AgentId],
            filters: [
                {
                    member: VoiceEventsByAgentMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: VoiceEventsByAgentMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone: 'UTC',
            segments: [
                VoiceEventsByAgentSegment.transferredInboundCalls,
                VoiceEventsByAgentSegment.callsInFinalStatus,
            ],
        })
    })

    it('transferredInboundVoiceCallsCountPerAgentQueryFactory should create a query with sorting', () => {
        const query = transferredInboundVoiceCallsCountPerAgentQueryFactory(
            statsFilters,
            'UTC',
            OrderDirection.Asc,
        )

        expect(query).toEqual({
            metricName:
                METRIC_NAMES.VOICE_TRANSFERRED_INBOUND_CALLS_COUNT_PER_AGENT,
            measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
            dimensions: [VoiceEventsByAgentDimension.AgentId],
            filters: [
                {
                    member: VoiceEventsByAgentMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: VoiceEventsByAgentMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone: 'UTC',
            segments: [
                VoiceEventsByAgentSegment.transferredInboundCalls,
                VoiceEventsByAgentSegment.callsInFinalStatus,
            ],
            order: [
                [
                    VoiceEventsByAgentMeasure.VoiceEventsCount,
                    OrderDirection.Asc,
                ],
            ],
        })
    })

    it('transferredInboundVoiceCallsCountQueryFactory should create a query', () => {
        const query = transferredInboundVoiceCallsCountQueryFactory(
            statsFilters,
            'UTC',
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.VOICE_TRANSFERRED_INBOUND_CALLS_COUNT,
            measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
            dimensions: [],
            filters: [
                {
                    member: VoiceEventsByAgentMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: VoiceEventsByAgentMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone: 'UTC',
            segments: [
                VoiceEventsByAgentSegment.transferredInboundCalls,
                VoiceEventsByAgentSegment.callsInFinalStatus,
            ],
        })
    })

    it('voiceEventsByAgentVoiceCallListQueryFactory should create a query with sorting', () => {
        const query = transferredInboundVoiceCallsPerAgentQueryFactory(
            statsFilters,
            'UTC',
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.VOICE_TRANSFERRED_INBOUND_CALLS_PER_AGENT,
            measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
            dimensions: [
                VoiceEventsByAgentDimension.AgentId,
                VoiceEventsByAgentDimension.IntegrationId,
                VoiceEventsByAgentDimension.CreatedAt,
                VoiceEventsByAgentDimension.TicketId,
                VoiceEventsByAgentDimension.TransferType,
                VoiceEventsByAgentDimension.TransferTargetAgentId,
                VoiceEventsByAgentDimension.TransferTargetExternalNumber,
                VoiceEventsByAgentDimension.TransferTargetQueueId,
                VoiceCallDimension.Duration,
                VoiceCallDimension.DisplayStatus,
                VoiceCallDimension.CallRecordingAvailable,
                VoiceCallDimension.CallRecordingUrl,
            ],
            filters: [
                {
                    member: VoiceEventsByAgentMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: VoiceEventsByAgentMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone: 'UTC',
            segments: [
                VoiceEventsByAgentSegment.transferredInboundCalls,
                VoiceEventsByAgentSegment.callsInFinalStatus,
            ],
            order: [
                [VoiceEventsByAgentDimension.CreatedAt, OrderDirection.Desc],
            ],
        })
    })

    it('declinedVoiceCallsPerAgentQueryFactory should create a query', () => {
        const query = declinedVoiceCallsPerAgentQueryFactory(
            statsFilters,
            'UTC',
        )

        expect(query).toEqual({
            metricName: METRIC_NAMES.VOICE_DECLINED_CALLS_PER_AGENT,
            measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
            dimensions: [
                VoiceEventsByAgentDimension.IntegrationId,
                VoiceEventsByAgentDimension.CreatedAt,
                VoiceEventsByAgentDimension.TicketId,
                VoiceEventsByAgentDimension.Status,
                VoiceCallDimension.AgentId,
                VoiceCallDimension.CustomerId,
                VoiceCallDimension.Direction,
                VoiceCallDimension.Duration,
                VoiceCallDimension.VoicemailAvailable,
                VoiceCallDimension.VoicemailUrl,
                VoiceCallDimension.CallRecordingAvailable,
                VoiceCallDimension.CallRecordingUrl,
                VoiceCallDimension.DisplayStatus,
                VoiceCallDimension.PhoneNumberSource,
            ],
            filters: [
                {
                    member: VoiceEventsByAgentMember.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [periodStart],
                },
                {
                    member: VoiceEventsByAgentMember.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [periodEnd],
                },
            ],
            timezone: 'UTC',
            segments: [
                VoiceEventsByAgentSegment.declinedCalls,
                VoiceEventsByAgentSegment.callsInFinalStatus,
            ],
            order: [
                [VoiceEventsByAgentDimension.CreatedAt, OrderDirection.Desc],
            ],
        })
    })

    it.each(
        [
            declinedVoiceCallsCountPerAgentQueryFactory,
            declinedVoiceCallsCountQueryFactory,
            declinedVoiceCallsPerAgentQueryFactory,
            transferredInboundVoiceCallsCountPerAgentQueryFactory,
            transferredInboundVoiceCallsCountQueryFactory,
            transferredInboundVoiceCallsPerAgentQueryFactory,
        ].map((factory) => ({ factoryName: factory.name, factory })),
    )(
        '$factoryName should append ticket period filters when requesting tags',
        ({ factory }) => {
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
                        member: VoiceEventsByAgentMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: VoiceEventsByAgentMember.PeriodEnd,
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
})
