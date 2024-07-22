import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {ConvertMetric, VoiceMetric} from 'state/ui/stats/types'
import {
    defaultEnrichmentFields,
    DrillDownDataHook,
    useDrillDownData,
    useEnrichedDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import {
    ConvertDrillDownRowData,
    formatConvertCampaignSalesDrillDownRowData,
    formatTicketDrillDownRowData,
    formatVoiceDrillDownRowData,
    TicketDrillDownRowData,
    VoiceCallDrillDownRowData,
} from 'pages/stats/DrillDownFormatters'
import {EnrichmentFields} from 'models/reporting/types'

export const getDrillDownHook = (
    metricName: DrillDownMetric
): DrillDownDataHook<
    TicketDrillDownRowData | ConvertDrillDownRowData | VoiceCallDrillDownRowData
> => {
    switch (metricName.metricName) {
        case ConvertMetric.CampaignSalesCount:
            return (metricData: DrillDownMetric) =>
                useEnrichedDrillDownData(
                    metricData,
                    [EnrichmentFields.CustomerIntegrationDataByExternalId],
                    formatConvertCampaignSalesDrillDownRowData
                )
        case VoiceMetric.AverageWaitTime:
        case VoiceMetric.AverageTalkTime:
            return (metricData: DrillDownMetric) =>
                useDrillDownData(metricData, formatVoiceDrillDownRowData)
        default:
            return (metricData: DrillDownMetric) =>
                useEnrichedDrillDownData(
                    metricData,
                    defaultEnrichmentFields,
                    formatTicketDrillDownRowData
                )
    }
}
