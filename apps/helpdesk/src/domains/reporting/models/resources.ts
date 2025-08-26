import { isAxiosError } from 'axios'

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
export const REPORTING_ENRICHED_ENDPOINT = '/api/reporting-enriched'
export const QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS = 202

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

const getReportQueryErrorHandler =
    (context: Record<string, unknown>) => (error: unknown) => {
        if (
            isAxiosError(error) &&
            isErrorStatusToReport(error.response?.status)
        ) {
            reportError(error, { extra: { context } })
        }
        throw error
    }

const post =
    (path: string) =>
    async <TData>(payload: unknown) => {
        return await client.post<ReportingResponse<TData>>(path, payload, {
            validateStatus,
        })
    }

const enrichedPost =
    (path: string) =>
    async <TData>(payload: unknown) => {
        return await client.post<TData>(path, payload, {
            validateStatus,
        })
    }

export const postReporting = <TData, TCube extends Cube = Cube>(
    queries: ReportingParams<TCube>,
) => {
    const { metricName, ...query } = queries[0]
    return post(REPORTING_ENDPOINT)<TData>({
        query: [query],
        metric_name: metricName,
    }).catch(getReportQueryErrorHandler({ query: JSON.stringify(queries) }))
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
        }),
    )
}
