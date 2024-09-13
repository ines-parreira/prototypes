import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {communicationSkillsQueryFactory} from 'models/reporting/queryFactories/auto-qa/communicationSkillsQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useCommunicationSkillsTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        communicationSkillsQueryFactory(filters, timezone),
        communicationSkillsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )
