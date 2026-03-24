import { reportError } from '@repo/logging'
import type { AxiosResponse } from 'axios'
import { isAxiosError } from 'axios'

import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type {
    Cube,
    EnrichmentFields,
    ReportingParams,
    ReportingQuery,
    ReportingResponse,
} from 'domains/reporting/models/types'
import client from 'models/api/resources'

export const REPORTING_ENDPOINT = '/api/reporting'
export const REPORTING_STATS_ENDPOINT = '/api/reporting/stats'
export const REPORTING_STATS_QUERY_ENDPOINT = '/api/reporting/stats/query'
export const REPORTING_ENRICHED_ENDPOINT = '/api/reporting-enriched'
export const QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS = 202
export const HTTP_STATUS_UNAUTHORIZED = 401
export const HTTP_STATUS_419 = 419
export const HTTP_STATUS_TOO_MANY_REQUESTS = 429
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500

export const isTransientErrorStatus = (status: number | undefined): boolean => {
    if (status === undefined) return false

    return (
        status === QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS ||
        status === HTTP_STATUS_UNAUTHORIZED ||
        status === HTTP_STATUS_419 ||
        status === HTTP_STATUS_TOO_MANY_REQUESTS ||
        (status >= HTTP_STATUS_INTERNAL_SERVER_ERROR && status < 600)
    )
}

export const isTransientErrorMessage = (
    message: string | undefined,
): boolean => {
    if (!message) return false

    return (
        message === 'Network Error' ||
        message === 'Request aborted' ||
        message === 'timeout exceeded'
    )
}

type APIReportingQuery = Omit<ReportingQuery, 'metricName'>

type ReportingQueryParams = {
    query: APIReportingQuery[]
    metric_name: string
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
export const postReportingV1 = <TData, TCube extends Cube = Cube>(
    queries: ReportingParams<TCube>,
): Promise<AxiosResponse<ReportingResponse<TData>>> => {
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

export const postReportingV2 = <TData, TMeta extends ScopeMeta = ScopeMeta>(
    query: BuiltQuery<TMeta>,
): Promise<AxiosResponse<ReportingResponse<TData>>> => {
    const { metricName, limit, offset, total, ...baseQuery } = query

    const searchParams = new URLSearchParams({
        metric_name: metricName,
        ...(limit ? { limit: limit.toString() } : {}),
        ...(offset ? { offset: offset.toString() } : {}),
        ...(total !== undefined ? { total: total.toString() } : {}),
    })

    return client
        .post<ReportingResponse<TData>>(
            `${REPORTING_STATS_ENDPOINT}?${searchParams.toString()}`,
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

export const postReportingV2Query = <
    TCube extends Cube,
    TMeta extends ScopeMeta = ScopeMeta,
>(
    query: BuiltQuery<TMeta>,
): Promise<AxiosResponse<ReportingQuery<TCube>>> => {
    const { metricName, limit, offset, total, ...baseQuery } = query

    const searchParams = new URLSearchParams({
        metric_name: metricName,
        ...(limit ? { limit: limit.toString() } : {}),
        ...(offset ? { offset: offset.toString() } : {}),
        ...(total !== undefined ? { total: total.toString() } : {}),
    })

    return client
        .post<ReportingQuery<TCube>>(
            `${REPORTING_STATS_QUERY_ENDPOINT}?${searchParams.toString()}`,
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
