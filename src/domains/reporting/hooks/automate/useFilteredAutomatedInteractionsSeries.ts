import {
    fetchAutomationDatasetTimeSeries,
    useAutomationDatasetTimeSeries,
} from 'domains/reporting/hooks/automate/timeSeries'
import { getAutomateStatsByMeasure } from 'domains/reporting/hooks/automate/utils'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

export const useFilteredAutomatedInteractionsSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    const { data, isFetching, isError } = useAutomationDatasetTimeSeries(
        filters,
        timezone,
        granularity,
    )

    const filteredAutomatedInteractionsSeries = getAutomateStatsByMeasure(
        AutomationDatasetMeasure.AutomatedInteractions,
        data,
    )

    return {
        data: [filteredAutomatedInteractionsSeries],
        isFetching,
        isError,
    }
}

export const fetchFilteredAutomatedInteractionsSeries = async (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    return fetchAutomationDatasetTimeSeries(
        filters,
        timezone,
        granularity,
    ).then((result) => {
        return {
            data: [
                getAutomateStatsByMeasure(
                    AutomationDatasetMeasure.AutomatedInteractions,
                    result,
                ),
            ],
            isFetching: false,
            isError: false,
        }
    })
}
