import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting//models/scopes/scope'
import type {
    MetricWithDecile,
    MetricWithDecileData,
    QueryReturnType,
    ReportingMetricItem,
    ReportingMetricItemValue,
} from 'domains/reporting/hooks/types'
import { withDeciles } from 'domains/reporting/hooks/withDeciles'
import { fetchPostStats, usePostStats } from 'domains/reporting/models/queries'

export const selectMeasurePerDimension = <
    TValue extends ReportingMetricItemValue,
    TMeta extends ScopeMeta,
>(
    data: ReportingMetricItem<TValue>[] | null | undefined,
    query: BuiltQuery<TMeta>,
    dimensionId?: string | number,
): MetricWithDecileData<TValue> => {
    const measures = query.measures
    const dimensions = query.dimensions || []

    if (
        !measures.length ||
        !dimensions.length ||
        data === null ||
        data === undefined
    ) {
        return {
            value: null,
            decile: null,
            allData: data ?? [],
            allValues: [],
            dimensions,
            measures,
        }
    }

    const dataMeasure =
        data.find(
            (row) => row[dimensions[0]]?.toString() === dimensionId?.toString(),
        ) ?? null

    const metric = dataMeasure?.[measures[0]] ?? null
    const decile = dataMeasure?.['decile'] ?? null

    const parseNumber = (value: TValue | null): number | null => {
        if (value === null) {
            return null
        }
        const parsed = typeof value === 'number' ? value : parseFloat(value)
        return isNaN(parsed) ? null : parsed
    }

    return {
        value: parseNumber(metric),
        decile: parseNumber(decile),
        allData: data,
        allValues: data.map((row) => {
            const dimension =
                dimensions.length > 1 && row[dimensions[1]]
                    ? `${row[dimensions[0]]},${row[dimensions[1]]}`
                    : (row[dimensions[0]] ?? '')
            return {
                dimension,
                value: parseNumber(row[measures[0]] ?? null),
                decile: parseNumber(row['decile'] ?? null),
            }
        }),
        dimensions,
        measures,
    }
}

const handleDataOnError = <
    TData,
    TObj extends { data: TData | null | undefined },
>(
    metricData: TObj,
): TObj & { data: TData | null } => {
    // `data` can be undefined on error
    if (metricData.data === undefined) {
        return { ...metricData, data: null }
    }

    return metricData as TObj & { data: TData | null } // TypeScript doesn't seem to understand data cannot be undefined here
}

export function useStatsMetricPerDimension<TMeta extends ScopeMeta = ScopeMeta>(
    query: BuiltQuery<TMeta>,
    dimensionId?: string,
    enabled?: boolean,
): MetricWithDecile<string> {
    const metricData = usePostStats<
        ReportingMetricItem<string>[],
        MetricWithDecileData<string>,
        TMeta
    >(query, {
        select: (data) => {
            const dataWithDeciles = withDeciles(data)
            return selectMeasurePerDimension<string, TMeta>(
                dataWithDeciles.data.data,
                query,
                dimensionId,
            )
        },
        enabled,
    })

    return handleDataOnError(metricData)
}

export const fetchStatsMetricPerDimension = async <
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    query: BuiltQuery<TMeta>,
    dimensionId?: string,
): Promise<MetricWithDecile<TValue>> => {
    return fetchPostStats<QueryReturnType<TValue>, never, TMeta>(query)
        .then((res) => {
            const dataWithDeciles = withDeciles(res)
            return {
                data: selectMeasurePerDimension<TValue, TMeta>(
                    dataWithDeciles.data.data,
                    query,
                    dimensionId,
                ),
                isFetching: false,
                isError: false,
            }
        })
        .catch(() => ({
            data: null,
            isFetching: false,
            isError: true,
        }))
}
