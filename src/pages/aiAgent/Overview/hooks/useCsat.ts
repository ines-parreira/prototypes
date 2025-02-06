import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {customerSatisfactionMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {StatsFilters, StatType} from 'models/stat/types'
import {KpiMetric} from 'pages/aiAgent/Overview/types'

import {getPreviousPeriod} from 'utils/reporting'

export const useCsat = (filters: StatsFilters, timezone: string): KpiMetric => {
    const result = useMultipleMetricsTrends(
        customerSatisfactionMetricPerAgentQueryFactory(filters, timezone),
        customerSatisfactionMetricPerAgentQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

    return {
        title: 'CSAT (Customer Satisfaction Score)',
        hint: 'The average satisfaction rating for AI Agent interactions, based on surveys sent after ticket resolution',
        metricType: StatType.Number,
        isLoading: result.isFetching,
        ...result.data?.[TicketSatisfactionSurveyMeasure.AvgSurveyScore],
    }
}
