import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { communicationSkillsQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/communicationSkillsQueryFactory'
import { communicationSkillsQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useCommunicationSkillsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        communicationSkillsQueryFactory(filters, timezone),
        communicationSkillsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        communicationSkillsQueryV2Factory({ filters, timezone }),
        communicationSkillsQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export const fetchCommunicationSkillsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        communicationSkillsQueryFactory(filters, timezone),
        communicationSkillsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        communicationSkillsQueryV2Factory({ filters, timezone }),
        communicationSkillsQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
