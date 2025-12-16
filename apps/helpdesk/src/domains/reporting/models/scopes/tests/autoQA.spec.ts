import {
    accuracyMetric,
    accuracyPerAgentMetric,
    accuracyPerAgentQueryV2Factory,
    accuracyQueryV2Factory,
    brandVoiceMetric,
    brandVoicePerAgentMetric,
    brandVoicePerAgentQueryV2Factory,
    brandVoiceQueryV2Factory,
    communicationSkillsMetric,
    communicationSkillsPerAgentMetric,
    communicationSkillsPerAgentQueryV2Factory,
    communicationSkillsQueryV2Factory,
    efficiencyMetric,
    efficiencyPerAgentMetric,
    efficiencyPerAgentQueryV2Factory,
    efficiencyQueryV2Factory,
    internalComplianceMetric,
    internalCompliancePerAgentMetric,
    internalCompliancePerAgentQueryV2Factory,
    internalComplianceQueryV2Factory,
    languageProficiencyMetric,
    languageProficiencyPerAgentMetric,
    languageProficiencyPerAgentQueryV2Factory,
    languageProficiencyQueryV2Factory,
    resolutionCompletenessMetric,
    resolutionCompletenessPerAgentMetric,
    resolutionCompletenessPerAgentQueryV2Factory,
    resolutionCompletenessQueryV2Factory,
    reviewedClosedTicketsMetric,
    reviewedClosedTicketsPerAgentMetric,
    reviewedClosedTicketsPerAgentQueryV2Factory,
    reviewedClosedTicketsQueryV2Factory,
} from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

describe('autoQA', () => {
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

    describe('accuracyMetric', () => {
        it('creates query', () => {
            const actual = accuracyMetric.build(context)

            const expected = {
                metricName: 'auto-qa-accuracy',
                scope: 'auto-qa',
                measures: ['averageAccuracyScore'],
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
                    {
                        member: 'status',
                        operator: 'one-of',
                        values: ['closed'],
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('accuracyPerAgentMetric', () => {
        it('creates query', () => {
            const actual = accuracyPerAgentMetric.build(context)

            const expected = {
                metricName: 'auto-qa-accuracy-per-agent',
                scope: 'auto-qa',
                measures: ['averageAccuracyScore'],
                dimensions: ['agentId'],
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
                    {
                        member: 'status',
                        operator: 'one-of',
                        values: ['closed'],
                    },
                ],
            }

            expect(actual).toEqual(expected)
        })
    })

    describe('QueryV2Factory methods', () => {
        describe.each([
            {
                name: 'accuracy',
                metric: accuracyMetric,
                factory: accuracyQueryV2Factory,
            },
            {
                name: 'accuracyPerAgent',
                metric: accuracyPerAgentMetric,
                factory: accuracyPerAgentQueryV2Factory,
            },
            {
                name: 'brandVoice',
                metric: brandVoiceMetric,
                factory: brandVoiceQueryV2Factory,
            },
            {
                name: 'brandVoicePerAgent',
                metric: brandVoicePerAgentMetric,
                factory: brandVoicePerAgentQueryV2Factory,
            },
            {
                name: 'communicationSkills',
                metric: communicationSkillsMetric,
                factory: communicationSkillsQueryV2Factory,
            },
            {
                name: 'communicationSkillsPerAgent',
                metric: communicationSkillsPerAgentMetric,
                factory: communicationSkillsPerAgentQueryV2Factory,
            },
            {
                name: 'efficiency',
                metric: efficiencyMetric,
                factory: efficiencyQueryV2Factory,
            },
            {
                name: 'efficiencyPerAgent',
                metric: efficiencyPerAgentMetric,
                factory: efficiencyPerAgentQueryV2Factory,
            },
            {
                name: 'internalCompliance',
                metric: internalComplianceMetric,
                factory: internalComplianceQueryV2Factory,
            },
            {
                name: 'internalCompliancePerAgent',
                metric: internalCompliancePerAgentMetric,
                factory: internalCompliancePerAgentQueryV2Factory,
            },
            {
                name: 'languageProficiency',
                metric: languageProficiencyMetric,
                factory: languageProficiencyQueryV2Factory,
            },
            {
                name: 'languageProficiencyPerAgent',
                metric: languageProficiencyPerAgentMetric,
                factory: languageProficiencyPerAgentQueryV2Factory,
            },
            {
                name: 'resolutionCompleteness',
                metric: resolutionCompletenessMetric,
                factory: resolutionCompletenessQueryV2Factory,
            },
            {
                name: 'resolutionCompletenessPerAgent',
                metric: resolutionCompletenessPerAgentMetric,
                factory: resolutionCompletenessPerAgentQueryV2Factory,
            },
            {
                name: 'reviewedClosedTickets',
                metric: reviewedClosedTicketsMetric,
                factory: reviewedClosedTicketsQueryV2Factory,
            },
            {
                name: 'reviewedClosedTicketsPerAgent',
                metric: reviewedClosedTicketsPerAgentMetric,
                factory: reviewedClosedTicketsPerAgentQueryV2Factory,
            },
        ])('$name', ({ metric, factory }) => {
            it('returns the same result as calling build directly', () => {
                const factoryResult = factory(context)
                const buildResult = metric.build(context)

                expect(factoryResult).toEqual(buildResult)
            })
        })
    })
})
