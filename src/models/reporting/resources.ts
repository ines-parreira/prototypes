import client from './mockedClient'
import {GetReportingParams, GetReportingResponse} from './types'

export const REPORTING_ENDPOINT = '/api/reporting'

export const getReporting = async <TData extends unknown[]>(
    params: GetReportingParams
) => {
    const res = await client.get<GetReportingResponse<TData>>(
        REPORTING_ENDPOINT,
        {
            params,
        }
    )
    return res
}
