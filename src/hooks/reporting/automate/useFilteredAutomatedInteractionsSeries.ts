import {
    fetchAutomationDatasetTimeSeries,
    useAutomationDatasetTimeSeries,
} from 'hooks/reporting/automate/timeSeries'
import {getAutomateStatsByMeasure} from 'hooks/reporting/automate/utils'
import {AutomationDatasetMeasure} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

export const useFilteredAutomatedInteractionsSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) => {
    const {data, isFetching, isError} = useAutomationDatasetTimeSeries(
        filters,
        timezone,
        granularity
    )

    const filteredAutomatedInteractionsSeries = getAutomateStatsByMeasure(
        AutomationDatasetMeasure.AutomatedInteractions,
        data
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
    granularity: ReportingGranularity
) => {
    return fetchAutomationDatasetTimeSeries(
        filters,
        timezone,
        granularity
    ).then((result) => {
        return {
            data: [
                getAutomateStatsByMeasure(
                    AutomationDatasetMeasure.AutomatedInteractions,
                    result
                ),
            ],
            isFetching: false,
            isError: false,
        }
    })
}
