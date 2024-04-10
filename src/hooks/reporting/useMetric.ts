import {QueryReturnType, selectMeasure} from 'hooks/reporting/useMetricTrend'
import {Cubes} from 'models/reporting/cubes'
import {usePostReporting} from 'models/reporting/queries'
import {ReportingQuery} from 'models/reporting/types'
import {Metric} from 'hooks/reporting/metrics'

export function useMetric<TCube extends Cubes = Cubes>(
    query: ReportingQuery<TCube>
): Metric {
    const currentPeriodMetric = usePostReporting<
        QueryReturnType<TCube['measures']>,
        number | null,
        TCube
    >([query], {
        select: (data) => selectMeasure(query.measures[0], data),
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
