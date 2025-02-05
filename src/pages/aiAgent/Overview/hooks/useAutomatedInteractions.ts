import {useQuery} from '@tanstack/react-query'

import {StatType} from 'models/stat/types'
import {getRealisticResponseTime} from 'pages/aiAgent/Overview/getRealisticResponseTime'
import {KpiMetric} from 'pages/aiAgent/Overview/types'

export const useAutomatedInteractions = (): KpiMetric => {
    // TODO: replace with Cube hook
    const result = useQuery({
        queryKey: ['automatedInteractions'],
        queryFn: (): Promise<{value: number; prevValue: number}> =>
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve({value: 450, prevValue: 300})
                }, getRealisticResponseTime())
            }),
    })

    return {
        title: 'Automated Interactions',
        hint: 'Total of fully automated AI Agent interactions solved without any agent intervention.',
        metricType: StatType.Number,
        value: result.data?.value,
        prevValue: result.data?.prevValue,
        isLoading: result.isLoading,
    }
}
