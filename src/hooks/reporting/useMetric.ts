import {QueryReturnType, selectMeasure} from 'hooks/reporting/useMetricTrend'
import {usePostReporting} from 'models/reporting/queries'
import {ReportingQuery} from 'models/reporting/types'
import {Metric} from 'hooks/reporting/metrics'

export function useMetric(currentPeriodQuery: ReportingQuery): Metric {
    const currentPeriodMetric = usePostReporting<
        QueryReturnType,
        number | null
    >([currentPeriodQuery], {
        select: (data) => selectMeasure(currentPeriodQuery.measures[0], data),
    })

    return {
        isFetching: currentPeriodMetric.isFetching,
        isError: currentPeriodMetric.isError,
        data:
            currentPeriodMetric.data !== undefined
                ? {
                      value: currentPeriodMetric.data,
                  }
                : undefined,
    }
}
