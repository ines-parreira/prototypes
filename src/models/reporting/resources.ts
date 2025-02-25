import client from 'models/api/resources'

import {
    Cube,
    EnrichmentFields,
    ReportingParams,
    ReportingQuery,
    ReportingResponse,
} from './types'

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

export const post =
    (path: string) =>
    async <TData>(payload: unknown) => {
        return await client.post<ReportingResponse<TData>>(path, payload, {
            validateStatus,
        })
    }

export const enrichedPost =
    (path: string) =>
    async <TData>(payload: unknown) => {
        return await client.post<TData>(path, payload, {
            validateStatus,
        })
    }

export const postReporting = <TData, TCube extends Cube = Cube>(
    queries: ReportingParams<TCube>,
) =>
    post(REPORTING_ENDPOINT)<TData>({
        query: queries,
    })

export const postEnrichedReporting = <TData, TCube extends Cube = Cube>(
    query: ReportingQuery<TCube>,
    enrichmentFields: EnrichmentFields[],
) =>
    enrichedPost(REPORTING_ENRICHED_ENDPOINT)<TData>({
        query,
        enrichment_fields: enrichmentFields,
    })
