import type {
    IDRecord,
    MergedRecord,
} from 'domains/reporting/hooks/withEnrichment'
import type { Cubes } from 'domains/reporting/models/cubes'
import type {
    DimensionName,
    MeasureName,
} from 'domains/reporting/models/scopes/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { EnrichmentFields } from 'domains/reporting/models/types'
import type { OrderDirection } from 'models/api/types'
import type { DrillDownReportingQuery } from 'models/job/types'

export type RequestedData = {
    isFetching: boolean
    isError: boolean
}

export type ReportingMetricItemValue = string | number | null

/**  TODO(Anissa)
 * Temporary type until V2 migration is complete
 * We can remove this type and use number instead
 * We should check every usage of this type and replace it with number
 **/
export type StringWhichShouldBeNumber = string

export type ReportingMetricItem<
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
> = Record<TCube['measures'][0] | TCube['dimensions'][0] | 'decile', TValue>

export type MetricWithDecileData<
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
> = {
    value: number | null
    decile: number | null
    allData: ReportingMetricItem<TValue, TCube>[]
    allValues?: {
        dimension: string | number
        value: number | null
        decile: number | null
    }[]
    dimensions?: readonly DimensionName[] | TCube['dimensions'][]
    measures?: readonly MeasureName[] | TCube['measures'][]
} | null

export type MetricWithDecile<
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
> = RequestedData & {
    data: MetricWithDecileData<TValue, TCube>
}

export type MetricWithDecileFetch<
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
> = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) => Promise<MetricWithDecile<TValue, TCube>>

export type MetricPerDimensionTrend<
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
> = RequestedData & {
    data: {
        value: QueryReturnType<TValue, TCube>
        prevValue: QueryReturnType<TValue, TCube>
    }
}

export type MetricWithEnrichment<
    T extends string,
    ID extends string,
> = RequestedData & {
    data: {
        allData: (MergedRecord<
            T,
            EnrichmentFields | EnrichmentFields.TicketId
        > &
            IDRecord<ID>)[]
    } | null
}

export type MergedRecordWithEnrichment = MergedRecord<
    DrillDownReportingQuery['measures'][0],
    EnrichmentFields
> &
    IDRecord<DrillDownReportingQuery['dimensions'][0]>

export type MetricPerDimensionWithEnrichmentData<
    T extends string,
    ID extends string,
> = {
    value: number | null
    allData: (MergedRecord<T, EnrichmentFields | EnrichmentFields.TicketId> &
        IDRecord<ID>)[]
} | null

export type MetricPerDimensionWithEnrichment<
    T extends string,
    ID extends string,
> = RequestedData & {
    data: MetricPerDimensionWithEnrichmentData<T, ID>
}

export type QueryReturnType<
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
> = ReportingMetricItem<TValue, TCube>[]
