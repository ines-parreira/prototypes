import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { communicationSkillsQueryFactory } from 'models/reporting/queryFactories/auto-qa/communicationSkillsQueryFactory'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

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
    )
