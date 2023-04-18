import client from 'models/api/resources'
import {ReportingParams, ReportingResponse} from './types'

export const REPORTING_ENDPOINT = '/api/reporting'

export const getReporting = async <TData extends unknown[]>(
    queries: ReportingParams
) => {
    const res = await client.get<ReportingResponse<TData>>(REPORTING_ENDPOINT, {
        params: {
            query: JSON.stringify(queries),
        },
    })
    return res
}

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
