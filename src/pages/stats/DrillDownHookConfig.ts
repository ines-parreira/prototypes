import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {ConvertMetric} from 'state/ui/stats/types'
import {
    DrillDownDataHook,
    useDrillDownData,
    useEnrichedDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import {
    ConvertDrillDownRowData,
    TicketDrillDownRowData,
} from 'pages/stats/DrillDownFormatters'

export const getDrillDownHook = (
    metricName: DrillDownMetric
): DrillDownDataHook<TicketDrillDownRowData | ConvertDrillDownRowData> => {
    switch (metricName.metricName) {
        case ConvertMetric.CampaignSalesCount:
            return useDrillDownData
        default:
            return useEnrichedDrillDownData
    }
}
