import {useQuery} from '@tanstack/react-query'

import {StatType} from 'models/stat/types'
import {getRealisticResponseTime} from 'pages/aiAgent/Overview/getRealisticResponseTime'
import {KpiMetric} from 'pages/aiAgent/Overview/types'

export const useAutomationRate = (): KpiMetric => {
    // TODO: replace with Cube hook
    const result = useQuery({
        queryKey: ['successRateCurrentValue'],
        queryFn: (): Promise<{value: number; prevValue: number}> =>
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve({value: 32.41, prevValue: 24.56})
                }, getRealisticResponseTime())
            }),
    })

    return {
        title: 'Automation Rate',
        hint: 'Automated interactions as a percent of all customer interactions.',
        metricType: StatType.Percent,
        value: result.data?.value,
        prevValue: result.data?.prevValue,
        isLoading: result.isLoading,
    }
}
