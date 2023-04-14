import client from 'models/api/resources'
import {GetReportingParams, GetReportingResponse} from './types'

export const REPORTING_ENDPOINT = '/api/reporting'

export const getReporting = async <TData extends unknown[]>(
    queries: GetReportingParams
) => {
    const res = await client.get<GetReportingResponse<TData>>(
        REPORTING_ENDPOINT,
        {
            params: {
                query: JSON.stringify(queries),
            },
        }
    )
    return res
}
