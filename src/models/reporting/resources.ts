import client from 'models/api/resources'
import {ReportingParams, ReportingResponse} from './types'

export const REPORTING_ENDPOINT = '/api/reporting'

export const postReporting = async <TData extends unknown[]>(
    queries: ReportingParams
) => {
    const res = await client.post<ReportingResponse<TData>>(
        REPORTING_ENDPOINT,
        {
            query: queries,
        }
    )
    return res
}
