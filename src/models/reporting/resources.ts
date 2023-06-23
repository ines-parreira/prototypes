import client from 'models/api/resources'
import {ReportingParams, ReportingResponse} from './types'

export const REPORTING_ENDPOINT = '/api/reporting'
export const QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS = 202

export const postReporting = async <TData extends unknown[]>(
    queries: ReportingParams
) => {
    const res = await client.post<ReportingResponse<TData>>(
        REPORTING_ENDPOINT,
        {
            query: queries,
        },
        {
            validateStatus: (status) => {
                if (
                    String(status) ===
                    String(QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS)
                ) {
                    return false
                }
                return status >= 200 && status < 300
            },
        }
    )
    return res
}
