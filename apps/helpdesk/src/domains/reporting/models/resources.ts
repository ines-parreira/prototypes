import { isAxiosError } from 'axios'

import { QueryFor, ScopeMeta } from 'domains/reporting/models/scopes/scope'
import {
    Cube,
    EnrichmentFields,
    ReportingParams,
    ReportingQuery,
    ReportingResponse,
} from 'domains/reporting/models/types'
import client from 'models/api/resources'
import { reportError } from 'utils/errors'

export const REPORTING_ENDPOINT = '/api/reporting'
export const REPORTING_STATS_ENDPOINT = '/api/reporting/stats'
export const REPORTING_STATS_QUERY_ENDPOINT = '/api/reporting/stats/query'
export const REPORTING_ENRICHED_ENDPOINT = '/api/reporting-enriched'
export const QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS = 202

type APIReportingQuery = Omit<ReportingQuery, 'metricName'>

type ReportingQueryParams = {
    query: APIReportingQuery[]
    metric_name: string
}

type APIReportingV2Query = Omit<QueryFor<ScopeMeta>, 'metricName'>

type ReportingV2QueryParams = {
    query: APIReportingV2Query
    metric_name?: string
}

type ReportingEnrichedQueryParams = {
    query: APIReportingQuery
    metric_name: string
    enrichment_fields: EnrichmentFields[]
}

const validateStatus = (status: number) => {
    if (
        String(status) === String(QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS)
    ) {
        return false
    }
    return status >= 200 && status < 300
}

const isErrorStatusToReport = (status: number | undefined) => {
    if (status === undefined) {
        return false
    }
    return status >= 400 && status < 500 && status !== 401
}

export const reportQueryErrorToSentry = (
    error: unknown,
    context: Record<string, string>,
) => {
    try {
        if (
            isAxiosError(error) &&
            isErrorStatusToReport(error.response?.status)
        ) {
            reportError(error, { extra: { context } })
        }
    } catch (error) {
        console.error('reportQueryErrorToSentry:', error)
    }
}

const getReportQueryErrorHandler =
    (context: Record<string, string>) => (error: unknown) => {
        reportQueryErrorToSentry(error, context)

        throw error
    }

const post =
    (path: string) =>
    async <TData>(payload: ReportingQueryParams) => {
        return await client.post<ReportingResponse<TData>>(path, payload, {
            validateStatus,
        })
    }

const postV2 =
    (path: string) =>
    async <TData>(payload: ReportingV2QueryParams) => {
        return await client.post<ReportingResponse<TData>>(path, payload, {
            validateStatus,
        })
    }

const enrichedPost =
    (path: string) =>
    async <TData>(payload: ReportingEnrichedQueryParams) => {
        return await client.post<TData>(path, payload, {
            validateStatus,
        })
    }

/**
 * @deprecated Use postReportingV2 instead
 */
export const postReporting = <TData, TCube extends Cube = Cube>(
    queries: ReportingParams<TCube>,
) => {
    const { metricName, ...query } = queries[0]
    return post(REPORTING_ENDPOINT)<TData>({
        query: [query],
        metric_name: metricName,
    }).catch(
        getReportQueryErrorHandler({
            query: JSON.stringify(queries),
            metricName,
        }),
    )
}

export const postReportingV2 = <TData>(query: QueryFor<ScopeMeta>) => {
    const { metricName, ...baseQuery } = query

    return postV2(REPORTING_STATS_ENDPOINT)<TData>({
        query: baseQuery,
        metric_name: metricName!,
    }).catch(
        getReportQueryErrorHandler({
            query: JSON.stringify(baseQuery),
            metricName: metricName!,
        }),
    )
}

export const postReportingV2Query = <TCube extends Cube = Cube>(
    query: QueryFor<ScopeMeta>,
    limit?: number,
) => {
    const { metricName, ...baseQuery } = query

    const reportingQueryUrl = new URL(REPORTING_STATS_QUERY_ENDPOINT)

    if (limit) {
        reportingQueryUrl.searchParams.set('limit', limit.toString())
    }

    return client
        .post<ReportingQuery<TCube>>(
            reportingQueryUrl.toString(),
            {
                query: baseQuery,
            },
            {
                validateStatus,
            },
        )
        .catch(
            getReportQueryErrorHandler({
                query: JSON.stringify(baseQuery),
                metricName: metricName!,
            }),
        )
}

export const postEnrichedReporting = <TData, TCube extends Cube = Cube>(
    query: ReportingQuery<TCube>,
    enrichmentFields: EnrichmentFields[],
) => {
    const { metricName, ...baseQuery } = query
    return enrichedPost(REPORTING_ENRICHED_ENDPOINT)<TData>({
        query: baseQuery,
        metric_name: metricName,
        enrichment_fields: enrichmentFields,
    }).catch(
        getReportQueryErrorHandler({
            query: JSON.stringify(query),
            enrichmentFields: JSON.stringify(enrichmentFields),
            metricName,
        }),
    )
}
