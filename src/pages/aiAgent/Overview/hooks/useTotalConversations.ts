import {useQuery} from '@tanstack/react-query'

import {StatType} from 'models/stat/types'
import {getRealisticResponseTime} from 'pages/aiAgent/Overview/getRealisticResponseTime'
import {KpiMetric} from 'pages/aiAgent/Overview/types'

export const useTotalConversations = (): KpiMetric => {
    // TODO: replace with Cube hook
    const result = useQuery({
        queryKey: ['totalConversations'],
        queryFn: (): Promise<{value: number; prevValue: number}> =>
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve({value: 843, prevValue: 754})
                }, getRealisticResponseTime())
            }),
    })

    return {
        title: 'Total Conversations',
        hint: 'The total number of conversations handled or influenced by the AI Agent for Sales.',
        metricType: StatType.Number,
        value: result.data?.value,
        prevValue: result.data?.prevValue,
        isLoading: result.isLoading,
    }
}
