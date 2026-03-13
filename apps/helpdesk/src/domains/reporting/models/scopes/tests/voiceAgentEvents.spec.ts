import { OrderDirection } from '@gorgias/helpdesk-types'

import {
    declinedCallsPerAgent,
    declinedCallsPerAgentQueryV2Factory,
    declinedVoiceCallsCount,
    declinedVoiceCallsCountPerAgent,
    declinedVoiceCallsCountPerAgentQueryV2Factory,
    declinedVoiceCallsCountQueryV2Factory,
    transferredInboundVoiceCallsCount,
    transferredInboundVoiceCallsCountPerAgent,
    transferredInboundVoiceCallsCountPerAgentQueryV2Factory,
    transferredInboundVoiceCallsCountQueryV2Factory,
    transferredInboundVoiceCallsPerAgent,
    transferredInboundVoiceCallsPerAgentQueryV2Factory,
} from 'domains/reporting/models/scopes/voiceAgentEvents'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

describe('voiceAgentEventsScope', () => {
    const filters: StatsFilters = {
        period: {
            start_datetime: '2025-09-03T00:00:00.000',
            end_datetime: '2025-09-03T23:59:59.000',
        },
    }
    const timezone = 'utc'
    const context = {
        filters,
        timezone,
    }

    describe('declinedVoiceCallsCount', () => {
        const expected = {
            metricName: 'voice-declined-calls-count',
            scope: 'voice-agent-events',
            measures: ['voiceCallsCount'],
            filters: [
                {
                    member: 'periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-03T00:00:00.000'],
                },
                {
                    member: 'periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-03T23:59:59.000'],
                },
                {
                    member: 'declinedCalls',
                    operator: 'one-of',
                    values: ['1'],
                },
                {
                    member: 'agentId',
                    operator: 'set',
                    values: [],
                },
            ],
            timezone: 'utc',
        }

        it('creates query', () => {
            const actual = declinedVoiceCallsCount.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = declinedVoiceCallsCount.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['voiceCallsCount', 'desc']],
            })
        })
    })

    describe('declinedVoiceCallsCountPerAgent', () => {
        const expected = {
            metricName: 'voice-declined-calls-count-per-agent',
            scope: 'voice-agent-events',
            measures: ['voiceCallsCount'],
            dimensions: ['agentId'],
            filters: [
                {
                    member: 'periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-03T00:00:00.000'],
                },
                {
                    member: 'periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-03T23:59:59.000'],
                },
                {
                    member: 'declinedCalls',
                    operator: 'one-of',
                    values: ['1'],
                },
            ],
            timezone: 'utc',
        }

        it('creates query', () => {
            const actual = declinedVoiceCallsCountPerAgent.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = declinedVoiceCallsCountPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['voiceCallsCount', 'desc']],
            })
        })
    })

    describe('transferredInboundVoiceCallsCount', () => {
        const expected = {
            metricName: 'voice-transferred-inbound-calls-count',
            scope: 'voice-agent-events',
            measures: ['voiceCallsCount'],
            filters: [
                {
                    member: 'periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-03T00:00:00.000'],
                },
                {
                    member: 'periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-03T23:59:59.000'],
                },
                {
                    member: 'transferredCalls',
                    operator: 'one-of',
                    values: ['1'],
                },
                {
                    member: 'agentId',
                    operator: 'set',
                    values: [],
                },
            ],
            timezone: 'utc',
        }

        it('creates query', () => {
            const actual = transferredInboundVoiceCallsCount.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = transferredInboundVoiceCallsCount.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['voiceCallsCount', 'desc']],
            })
        })
    })

    describe('transferredInboundVoiceCallsCountPerAgent', () => {
        const expected = {
            metricName: 'voice-transferred-inbound-calls-count-per-agent',
            scope: 'voice-agent-events',
            measures: ['voiceCallsCount'],
            dimensions: ['agentId'],
            filters: [
                {
                    member: 'periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-03T00:00:00.000'],
                },
                {
                    member: 'periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-03T23:59:59.000'],
                },
                {
                    member: 'transferredCalls',
                    operator: 'one-of',
                    values: ['1'],
                },
            ],
            timezone: 'utc',
        }

        it('creates query', () => {
            const actual =
                transferredInboundVoiceCallsCountPerAgent.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = transferredInboundVoiceCallsCountPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['voiceCallsCount', 'desc']],
            })
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('declinedVoiceCallsCountQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    declinedVoiceCallsCountQueryV2Factory(context)
                const buildResult = declinedVoiceCallsCount.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('declinedVoiceCallsCountPerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    declinedVoiceCallsCountPerAgentQueryV2Factory(context)
                const buildResult =
                    declinedVoiceCallsCountPerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('transferredInboundVoiceCallsCountQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    transferredInboundVoiceCallsCountQueryV2Factory(context)
                const buildResult =
                    transferredInboundVoiceCallsCount.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })

        describe('transferredInboundVoiceCallsCountPerAgentQueryV2Factory', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    transferredInboundVoiceCallsCountPerAgentQueryV2Factory(
                        context,
                    )
                const buildResult =
                    transferredInboundVoiceCallsCountPerAgent.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })

    describe('transferredInboundVoiceCallsPerAgent', () => {
        const expected = {
            metricName: 'voice-transferred-inbound-calls-per-agent',
            scope: 'voice-agent-events',
            measures: ['voiceCallsCount'],
            dimensions: [
                'agentId',
                'integrationId',
                'createdDatetime',
                'ticketId',
                'transferType',
                'transferTargetAgentId',
                'transferTargetExternalNumber',
                'transferTargetQueueId',
                'duration',
                'displayStatus',
                'callRecordingAvailable',
                'callRecordingUrl',
            ],
            filters: [
                {
                    member: 'periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-03T00:00:00.000'],
                },
                {
                    member: 'periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-03T23:59:59.000'],
                },
                {
                    member: 'transferredCalls',
                    operator: 'one-of',
                    values: ['1'],
                },
            ],
            timezone: 'utc',
        }

        it('creates query', () => {
            const actual = transferredInboundVoiceCallsPerAgent.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = transferredInboundVoiceCallsPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['createdDatetime', 'desc']],
            })
        })
    })

    describe('transferredInboundVoiceCallsPerAgentQueryV2Factory', () => {
        it('returns the same result as calling build directly', () => {
            const factoryResult =
                transferredInboundVoiceCallsPerAgentQueryV2Factory(context)
            const buildResult =
                transferredInboundVoiceCallsPerAgent.build(context)

            expect(factoryResult).toEqual(buildResult)
        })
    })

    describe('declinedCallsPerAgent', () => {
        const expected = {
            metricName: 'voice-declined-calls-per-agent',
            scope: 'voice-agent-events',
            measures: ['voiceCallsCount'],
            dimensions: [
                'integrationId',
                'createdDatetime',
                'ticketId',
                'status',
                'assignedAgentId',
                'customerId',
                'callDirection',
                'duration',
                'voicemailAvailable',
                'voicemailUrl',
                'displayStatus',
                'callRecordingAvailable',
                'callRecordingUrl',
                'source',
            ],
            filters: [
                {
                    member: 'periodStart',
                    operator: 'afterDate',
                    values: ['2025-09-03T00:00:00.000'],
                },
                {
                    member: 'periodEnd',
                    operator: 'beforeDate',
                    values: ['2025-09-03T23:59:59.000'],
                },
                {
                    member: 'declinedCalls',
                    operator: 'one-of',
                    values: ['1'],
                },
            ],
            timezone: 'utc',
        }

        it('creates query', () => {
            const actual = declinedCallsPerAgent.build(context)

            expect(actual).toEqual(expected)
        })

        it('applies sorting order', () => {
            const actual = declinedCallsPerAgent.build({
                ...context,
                sortDirection: OrderDirection.Desc,
            })

            expect(actual).toEqual({
                ...expected,
                order: [['createdDatetime', 'desc']],
            })
        })
    })

    describe('declinedCallsPerAgentQueryV2Factory', () => {
        it('returns the same result as calling declinedCallsPerAgent build', () => {
            const factoryResult = declinedCallsPerAgentQueryV2Factory(context)
            const buildResult = declinedCallsPerAgent.build(context)

            expect(factoryResult).toEqual(buildResult)
        })
    })
})
