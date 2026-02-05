import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    breachedVoiceCallsQueryV2Factory,
    satisfiedOrBreachedVoiceCallsTimeseriesQueryV2Factory,
    voiceCallsSlaAchievementRateQueryV2Factory,
} from 'domains/reporting/models/scopes/voiceSLA'
import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    ApiOnlyOperatorEnum,
    LogicalOperatorEnum,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { VoiceSLAStatus } from 'domains/reporting/pages/sla/constants'

describe('voiceSLA scope', () => {
    describe('voiceCallsSlaAchievementRate', () => {
        it('should build query with correct metric name', () => {
            const query = voiceCallsSlaAchievementRateQueryV2Factory({
                filters: {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                timezone: 'UTC',
            })

            expect(query.metricName).toBe(
                METRIC_NAMES.SLA_ACHIEVEMENT_RATE_VOICE_CALLS,
            )
        })

        it('should build query with correct measures', () => {
            const query = voiceCallsSlaAchievementRateQueryV2Factory({
                filters: {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                timezone: 'UTC',
            })

            expect(query.measures).toEqual(['slaAchievementRate'])
        })

        it('should apply filters from context', () => {
            const query = voiceCallsSlaAchievementRateQueryV2Factory({
                filters: {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                    agentId: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [456],
                    },
                },
                timezone: 'UTC',
            })

            expect(query.filters).toBeDefined()
            expect(query.filters?.length).toBeGreaterThan(0)
        })
    })

    describe('breachedVoiceCalls', () => {
        it('should build query with correct metric name', () => {
            const query = breachedVoiceCallsQueryV2Factory({
                filters: {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                timezone: 'UTC',
            })

            expect(query.metricName).toBe(METRIC_NAMES.SLA_BREACHED_VOICE_CALLS)
        })

        it('should build query with correct measures', () => {
            const query = breachedVoiceCallsQueryV2Factory({
                filters: {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                },
                timezone: 'UTC',
            })

            expect(query.measures).toEqual(['breachedExposures'])
        })

        it('should apply filters from context', () => {
            const query = breachedVoiceCallsQueryV2Factory({
                filters: {
                    period: {
                        start_datetime: '2021-01-01T00:00:00Z',
                        end_datetime: '2021-01-02T00:00:00Z',
                    },
                    agentId: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [789],
                    },
                },
                timezone: 'UTC',
            })

            expect(query.filters).toBeDefined()
            expect(query.filters?.length).toBeGreaterThan(0)
        })
    })

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

            expect(query.measures).toEqual(['totalExposures'])
            expect(query.dimensions).toEqual(['callSlaStatusLabel'])
            expect(query.time_dimensions).toHaveLength(1)
            expect(query.time_dimensions?.[0]).toEqual({
                dimension: 'queuedDate',
                granularity: ReportingGranularity.Hour,
            })
            expect(query.filters).toContainEqual({
                member: 'callSlaStatus',
                operator: ApiOnlyOperatorEnum.SET,
                values: [],
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
    })

    describe('VoiceSLAStatus enum', () => {
        it('should have correct values for statuses', () => {
            expect(VoiceSLAStatus.Breached).toBe('breached')
            expect(VoiceSLAStatus.Satisfied).toBe('achieved')
        })
    })
})
