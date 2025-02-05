import {useQuery} from '@tanstack/react-query'

import {StatType} from 'models/stat/types'
import {getRealisticResponseTime} from 'pages/aiAgent/Overview/getRealisticResponseTime'
import {KpiMetric} from 'pages/aiAgent/Overview/types'

export const useCsat = (): KpiMetric => {
    // TODO: replace with Cube hook
    const result = useQuery({
        queryKey: ['csat'],
        queryFn: (): Promise<{value: number; prevValue: number}> =>
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve({value: 3.1, prevValue: 3.5})
                }, getRealisticResponseTime())
            }),
    })

    return {
        title: 'CSAT (Customer Satisfaction Score)',
        hint: 'The average satisfaction rating for AI Agent interactions, based on surveys sent after ticket resolution',
        metricType: StatType.Number,
        value: result.data?.value,
        prevValue: result.data?.prevValue,
        isLoading: result.isLoading,
    }
}
