import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'
import type { DrillDownModalTigerParams } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'

export const useAiAgentTrendCardDrillDown = (
    params: Omit<DrillDownModalTigerParams, 'metricName'> & {
        metricName?: DrillDownModalTigerParams['metricName']
    },
) => {
    const drillDown = useDrillDownModalTrigger({
        ...params,
        metricName:
            params.metricName as DrillDownModalTigerParams['metricName'],
    })

    if (!params.metricName) return undefined

    return drillDown
}
