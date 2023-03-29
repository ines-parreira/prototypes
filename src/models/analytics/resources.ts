import client from 'models/api/resources'

import {GetAnalyticsParams, GetAnalyticsResponse} from './types'

export const ANALYTICS_ENDPOINT = '/api/reporting'

export const getAnalytics = async <TData extends unknown[]>(
    params: GetAnalyticsParams
) => {
    const res = await client.get<GetAnalyticsResponse<TData>>(
        ANALYTICS_ENDPOINT,
        {
            params,
        }
    )
    return res
}
