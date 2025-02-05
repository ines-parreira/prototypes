import {useQuery} from '@tanstack/react-query'

import {StatType} from 'models/stat/types'
import {getRealisticResponseTime} from 'pages/aiAgent/Overview/getRealisticResponseTime'
import {KpiMetric} from 'pages/aiAgent/Overview/types'

export const useGmvInfluenced = (): KpiMetric => {
    // TODO: replace with Cube hook
    const result = useQuery({
        queryKey: ['gmvInfluenced'],
        queryFn: (): Promise<{value: number; prevValue: number}> =>
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve({value: 12000, prevValue: 10000})
                }, getRealisticResponseTime())
            }),
    })

    return {
        title: 'GMV Influenced',
        hint: 'The total revenue generated from orders placed during or after a conversation with the AI Agent, without human intervention.',
        metricType: StatType.Currency,
        value: result.data?.value,
        prevValue: result.data?.prevValue,
        isLoading: result.isLoading,
        // TODO: replace with account currency
        currency: 'USD',
    }
}
