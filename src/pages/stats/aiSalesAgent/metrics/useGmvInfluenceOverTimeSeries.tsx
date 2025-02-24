/* eslint-disable @typescript-eslint/no-unused-vars */
import {useQuery, UseQueryResult} from '@tanstack/react-query'

import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'

import {ReportingGranularity} from 'models/reporting/types'

import {StatsFilters} from 'models/stat/types'
import {getRealisticResponseTime} from 'pages/aiAgent/Overview/getRealisticResponseTime'

const useGmvInfluenceOverTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): UseQueryResult<TimeSeriesDataItem[][]> => {
    const result = useQuery({
        queryKey: ['useGmvInfluenceOverTimeSeries'],
        queryFn: (): Promise<{data: TimeSeriesDataItem[]}> =>
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        data: [
                            {
                                dateTime: '2025-02-13T00:00:00.000',
                                value: 0.9,
                                label: 'AiSalesAgent.GmvInfluencedOverTime',
                            },
                            {
                                dateTime: '2025-02-14T00:00:00.000',
                                value: 0.9,
                                label: 'AiSalesAgent.GmvInfluencedOverTime',
                            },
                            {
                                dateTime: '2025-02-15T00:00:00.000',
                                value: 0.04,
                                label: 'AiSalesAgent.GmvInfluencedOverTime',
                            },
                            {
                                dateTime: '2025-02-17T00:00:00.000',
                                value: 0.4,
                                label: 'AiSalesAgent.GmvInfluencedOverTime',
                            },
                            {
                                dateTime: '2025-02-18T00:00:00.000',
                                value: 0.06,
                                label: 'AiSalesAgent.GmvInfluencedOverTime',
                            },
                        ],
                    })
                }, getRealisticResponseTime())
            }),
    })

    return {
        data: result?.data ? [result?.data?.data] : undefined,
    } as UseQueryResult<TimeSeriesDataItem[][]>
}

export default useGmvInfluenceOverTimeSeries
