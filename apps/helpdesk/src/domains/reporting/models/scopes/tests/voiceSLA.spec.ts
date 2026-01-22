import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    satisfiedOrBreachedVoiceCallsTimeseriesQueryV2Factory,
    VoiceSLAStatus,
} from 'domains/reporting/models/scopes/voiceSLA'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

describe('voiceSLA scope', () => {
    describe('satisfiedOrBreachedVoiceCallsTimeseries', () => {
        it('should build query with correct metric name', () => {
            const query = satisfiedOrBreachedVoiceCallsTimeseriesQueryV2Factory(
                {
                    filters: {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                    },
                    timezone: 'UTC',
                    granularity: ReportingGranularity.Hour,
                },
            )

            expect(query.metricName).toBe(
                METRIC_NAMES.SLA_SATISFIED_OR_BREACHED_VOICE_CALLS_TIME_SERIES,
            )
        })

        it('should build timeseries query with correct measures and time dimensions', () => {
            const query = satisfiedOrBreachedVoiceCallsTimeseriesQueryV2Factory(
                {
                    filters: {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                    },
                    timezone: 'UTC',
                    granularity: ReportingGranularity.Hour,
                },
            )

            expect(query.measures).toEqual([
                'breachedExposures',
                'achievedExposures',
            ])
            expect(query.time_dimensions).toHaveLength(1)
            expect(query.time_dimensions?.[0]).toEqual({
                dimension: 'queuedDate',
                granularity: ReportingGranularity.Hour,
            })
        })

        it('should apply filters from context', () => {
            const query = satisfiedOrBreachedVoiceCallsTimeseriesQueryV2Factory(
                {
                    filters: {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                        agentId: {
                            operator: LogicalOperatorEnum.ONE_OF,
                            values: [123],
                        },
                    },
                    timezone: 'UTC',
                    granularity: ReportingGranularity.Day,
                },
            )

            expect(query.filters).toBeDefined()
            expect(query.filters?.length).toBeGreaterThan(0)
        })

        it('should set limit to 10,000', () => {
            const query = satisfiedOrBreachedVoiceCallsTimeseriesQueryV2Factory(
                {
                    filters: {
                        period: {
                            start_datetime: '2021-01-01T00:00:00Z',
                            end_datetime: '2021-01-02T00:00:00Z',
                        },
                    },
                    timezone: 'UTC',
                    granularity: ReportingGranularity.Day,
                },
            )

            expect(query.limit).toBe(10_000)
        })
    })

    describe('VoiceSLAStatus enum', () => {
        it('should have correct values for statuses', () => {
            expect(VoiceSLAStatus.Breached).toBe('1')
            expect(VoiceSLAStatus.Satisfied).toBe('0')
        })
    })
})
