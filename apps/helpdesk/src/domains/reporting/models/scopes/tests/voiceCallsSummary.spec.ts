import {
    voiceCallsSummaryMetrics,
    voiceCallsSummaryMetricsQueryFactoryV2,
} from 'domains/reporting/models/scopes/voiceCallsSummary'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

describe('voiceCallsSummaryScope', () => {
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

    describe('voiceCallsSummaryMetrics', () => {
        it('creates query', () => {
            const actual = voiceCallsSummaryMetrics.build(context)

            const expected = {
                metricName: 'voice-call-summary',
                scope: 'voice-calls-summary',
                measures: [
                    'inboundVoiceCallsCount',
                    'outboundVoiceCallsCount',
                    'answeredVoiceCallsCount',
                    'cancelledVoiceCallsCount',
                    'abandonedVoiceCallsCount',
                    'missedVoiceCallsCount',
                    'unansweredVoiceCallsCount',
                    'callbackRequestedVoiceCallsCount',
                    'averageTalkTimeInSeconds',
                    'averageWaitTimeInSeconds',
                    'slaAchievementRate',
                ],
                timezone: 'utc',
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
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe('voiceCallsSummaryMetricsQueryFactoryV2', () => {
            it('returns the same result as calling build directly', () => {
                const factoryResult =
                    voiceCallsSummaryMetricsQueryFactoryV2(context)
                const buildResult = voiceCallsSummaryMetrics.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})
