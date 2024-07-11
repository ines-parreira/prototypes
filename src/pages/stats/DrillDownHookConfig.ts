import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {ConvertMetric, VoiceMetric} from 'state/ui/stats/types'
import {
    DrillDownDataHook,
    useDrillDownData,
    useEnrichedDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import {
    ConvertDrillDownRowData,
    formatConvertCampaignSalesDrillDownRowData,
    formatVoiceDrillDownRowData,
    TicketDrillDownRowData,
    VoiceCallDrillDownRowData,
} from 'pages/stats/DrillDownFormatters'

export const getDrillDownHook = (
    metricName: DrillDownMetric
): DrillDownDataHook<
    TicketDrillDownRowData | ConvertDrillDownRowData | VoiceCallDrillDownRowData
> => {
    switch (metricName.metricName) {
        case ConvertMetric.CampaignSalesCount:
            return (metricData: DrillDownMetric) =>
                useDrillDownData(
                    metricData,
                    formatConvertCampaignSalesDrillDownRowData
                )
        case VoiceMetric.AverageWaitTime:
        case VoiceMetric.AverageTalkTime:
            return (metricData: DrillDownMetric) =>
                useDrillDownData(metricData, formatVoiceDrillDownRowData)
        default:
            return useEnrichedDrillDownData
    }
}
