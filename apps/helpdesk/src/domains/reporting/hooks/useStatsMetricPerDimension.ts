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
import type { StatsFilters } from 'domains/reporting/models/stat/types'

type EntityMetricResult = Pick<
    MetricWithDecile,
    'data' | 'isFetching' | 'isError'
>

export type EntityMetricConfig = {
    use: (filters: StatsFilters, timezone: string) => EntityMetricResult
    fetch: (
        filters: StatsFilters,
        timezone: string,
    ) => Promise<EntityMetricResult>
}

export type AssembledEntityMetrics<TKeys extends string> = {
    data: Record<TKeys, Partial<Record<string, number | null>>>
    isLoading: boolean
    isError: boolean
    loadingStates: Record<TKeys, boolean>
}

export const toEntityMap = (
    metric: Pick<MetricWithDecile, 'data'>,
): Partial<Record<string, number | null>> =>
    Object.fromEntries(
        (metric.data?.allValues ?? []).map((v) => [v.dimension, v.value]),
    )

const assembleEntityMetrics = <TKeys extends string>(
    config: Record<TKeys, EntityMetricResult>,
): AssembledEntityMetrics<TKeys> => ({
    data: Object.fromEntries(
        Object.entries<EntityMetricResult>(config).map(([key, metric]) => [
            key,
            toEntityMap(metric),
        ]),
    ) as Record<TKeys, Partial<Record<string, number | null>>>,
    isLoading: Object.values<EntityMetricResult>(config).some(
        (m) => m.isFetching,
    ),
    isError: Object.values<EntityMetricResult>(config).some((m) => m.isError),
    loadingStates: Object.fromEntries(
        Object.entries<EntityMetricResult>(config).map(([key, metric]) => [
            key,
            metric.isFetching,
        ]),
    ) as Record<TKeys, boolean>,
})

export const mapMetricValues = (
    metric: EntityMetricResult,
    transform: (value: number | null) => number | null,
    extraDependencies?: Pick<EntityMetricResult, 'isFetching' | 'isError'>[],
): EntityMetricResult => ({
    isFetching:
        metric.isFetching ||
        (extraDependencies?.some((e) => e.isFetching) ?? false),
    isError:
        metric.isError || (extraDependencies?.some((e) => e.isError) ?? false),
    data: metric.data
        ? {
              ...metric.data,
              value: transform(metric.data.value),
              allValues: (metric.data.allValues ?? []).map((v) => ({
                  ...v,
                  value: transform(v.value),
              })),
          }
        : null,
})

export const assembleEntityRows = <TRow, TEntity extends string = string>(
    entityData: Record<
        string,
        Partial<Record<string, number | null | undefined>>
    >,
    entities: TEntity[],
    buildRow: (entity: TEntity) => TRow,
    options?: { skipEmptyCheck?: boolean },
): TRow[] => {
    const isZeroOrMissing = (value?: number | null) =>
        value == null || value === 0 || Number.isNaN(value)

    const isEmpty = Object.values(entityData).every((map) =>
        Object.values(map).every(isZeroOrMissing),
    )

    if (!options?.skipEmptyCheck && isEmpty) return []

    return entities.map(buildRow)
}

export const useEntityMetrics = <TKeys extends string>(
    config: Record<TKeys, EntityMetricConfig>,
    filters: StatsFilters,
    timezone: string,
): AssembledEntityMetrics<TKeys> => {
    const entries = Object.entries<EntityMetricConfig>(config)
    const results = entries.map(([, { use }]) => use(filters, timezone))
    return assembleEntityMetrics(
        Object.fromEntries(
            entries.map(([key], i) => [key, results[i]]),
        ) as Record<TKeys, EntityMetricResult>,
    )
}

export const fetchEntityMetrics = async <TKeys extends string>(
    config: Record<TKeys, EntityMetricConfig>,
    filters: StatsFilters,
    timezone: string,
): Promise<AssembledEntityMetrics<TKeys>> => {
    const entries = Object.entries<EntityMetricConfig>(config)
    const results = await Promise.all(
        entries.map(([, { fetch }]) => fetch(filters, timezone)),
    )
    return assembleEntityMetrics(
        Object.fromEntries(
            entries.map(([key], i) => [key, results[i]]),
        ) as Record<TKeys, EntityMetricResult>,
    )
}

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
