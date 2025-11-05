import { fetchAutomationDatasetTimeSeries } from 'domains/reporting/hooks/automate/timeSeries'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

export const fetchFilteredAutomatedInteractionsSeries = async (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    return fetchAutomationDatasetTimeSeries(
        filters,
        timezone,
        granularity,
    ).then((result) => ({
        data: result,
        isFetching: false,
        isError: false,
    }))
}
