import _groupBy from 'lodash/groupBy'

import { stripEscapedQuotes } from 'domains/reporting/hooks/common/utils'
import { getPeriodDateTimesFromFilters } from 'domains/reporting/hooks/helpers'
import { objectMap } from 'domains/reporting/hooks/useTimeSeries'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { BREAKDOWN_FIELD } from 'domains/reporting/hooks/withBreakdown'
import type { DataResponse } from 'domains/reporting/hooks/withDeciles'
import { fetchPostStats, usePostStats } from 'domains/reporting/models/queries'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

const select =
    <TMeta extends ScopeMeta>(statsQuery: BuiltQuery<TMeta>) =>
    (res: DataResponse['data']['data']) => {
        const dimension = statsQuery.time_dimensions?.[0]?.dimension
        const granularity = statsQuery.time_dimensions?.[0]?.granularity

        const dateTimeToValuesMap = res.reduce<
            Partial<Record<string, { values: number[]; rawData: any }>>
        >((acc, item) => {
            const key = formatReportingQueryDate(item[String(dimension)])
            const values = statsQuery.measures.map((measure) =>
                parseFloat(item[measure] || '0'),
            )
            acc[key] = { values, rawData: item }
            return acc
        }, {})

        const dateTimes = getPeriodDateTimesFromFilters(
            statsQuery.filters,
            granularity,
        )
        return statsQuery.measures.map((_, index) => {
            return dateTimes.map((dateTime) => {
                const entry = dateTimeToValuesMap[dateTime]
                const values = entry?.values || []
                const rawData = entry?.rawData
                return {
                    dateTime,
                    value: values[index] || 0,
                    label: statsQuery.measures[index],
                    rawData,
                }
            })
        })
    }

export type TimeSeriesPerDimension = Record<string, TimeSeriesDataItem[][]>

export const selectPerDimension =
    <TMeta extends ScopeMeta>(statsQuery: BuiltQuery<TMeta>) =>
    (res: DataResponse['data']['data']): TimeSeriesPerDimension => {
        let escapedResponse = res
        const dimension = statsQuery?.dimensions?.[0]

        if (dimension === BREAKDOWN_FIELD) {
            escapedResponse = res.map((item) => {
                return {
                    ...item,
                    [BREAKDOWN_FIELD]: stripEscapedQuotes(
                        item[BREAKDOWN_FIELD],
                    ),
                }
            })
        }

        return objectMap(
            _groupBy(escapedResponse, dimension),
            select(statsQuery),
        )
    }

export async function fetchStatsTimeSeriesPerDimension<
    TMeta extends ScopeMeta = ScopeMeta,
>(queryV2: BuiltQuery<TMeta>) {
    return fetchPostStats<
        Record<string, string>[],
        Record<string, TimeSeriesDataItem[][]>,
        TMeta
    >(queryV2, {}).then((res) =>
        selectPerDimension<TMeta>(queryV2)(res.data.data),
    )
}

export function useStatsTimeSeriesPerDimension<TMeta extends ScopeMeta>(
    statsQuery: BuiltQuery<TMeta>,
    enabled = true,
) {
    return usePostStats<
        Record<string, string>[],
        Record<string, TimeSeriesDataItem[][]>,
        TMeta
    >(statsQuery, {
        select: (res) => selectPerDimension<TMeta>(statsQuery)(res.data.data),
        enabled,
    })
}
