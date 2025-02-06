import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {AutomationDatasetMeasure} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {automationDatasetQueryFactory} from 'models/reporting/queryFactories/automate_v2/metrics'
import {StatsFilters, StatType} from 'models/stat/types'
import {KpiMetric} from 'pages/aiAgent/Overview/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useAutomatedInteractions = (
    filters: StatsFilters,
    timezone: string
): KpiMetric => {
    const result = useMultipleMetricsTrends(
        automationDatasetQueryFactory(filters, timezone),
        automationDatasetQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

    return {
        title: 'Automated Interactions',
        hint: 'Total of fully automated AI Agent interactions solved without any agent intervention.',
        metricType: StatType.Number,
        isLoading: result.isFetching,
        ...result.data?.[AutomationDatasetMeasure.AutomatedInteractions],
    }
}
