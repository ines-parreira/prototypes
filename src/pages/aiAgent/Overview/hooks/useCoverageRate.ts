import {useQuery} from '@tanstack/react-query'

import {StatType} from 'models/stat/types'
import {getRealisticResponseTime} from 'pages/aiAgent/Overview/getRealisticResponseTime'
import {KpiMetric} from 'pages/aiAgent/Overview/types'

export const useCoverageRate = (): KpiMetric => {
    // TODO: replace with Cube hook
    const result = useQuery({
        queryKey: ['coverageRate'],
        queryFn: (): Promise<{value: number; prevValue: number}> =>
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve({value: 30, prevValue: 25})
                }, getRealisticResponseTime())
            }),
    })

    return {
        title: 'Coverage Rate',
        hint: 'Percentage of tickets that AI Agent attempted to respond to.',
        metricType: StatType.Percent,
        value: result.data?.value,
        prevValue: result.data?.prevValue,
        isLoading: result.isLoading,
    }
}
