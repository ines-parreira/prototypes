import {
    defaultEnrichmentFields,
    DrillDownDataHook,
    useDrillDownData,
    useEnrichedDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import { EnrichmentFields } from 'models/reporting/types'
import {
    ConvertDrillDownRowData,
    formatConvertCampaignSalesDrillDownRowData,
    formatTicketDrillDownRowData,
    formatVoiceDrillDownRowData,
    TicketDrillDownRowData,
    VoiceCallDrillDownRowData,
} from 'pages/stats/DrillDownFormatters'
import { DrillDownMetric } from 'state/ui/stats/drillDownSlice'
import {
    ConvertMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'state/ui/stats/types'

export const getDrillDownHook = (
    metricName: DrillDownMetric,
): DrillDownDataHook<
    TicketDrillDownRowData | ConvertDrillDownRowData | VoiceCallDrillDownRowData
> => {
    switch (metricName.metricName) {
        case ConvertMetric.CampaignSalesCount:
            return (metricData: DrillDownMetric) =>
                useEnrichedDrillDownData(
                    metricData,
                    [EnrichmentFields.CustomerIntegrationDataByExternalId],
                    formatConvertCampaignSalesDrillDownRowData,
                    EnrichmentFields.OrderCustomerId,
                )
        case VoiceMetric.AverageWaitTime:
        case VoiceMetric.AverageTalkTime:
        case VoiceMetric.QueueAverageWaitTime:
        case VoiceMetric.QueueAverageTalkTime:
        case VoiceMetric.QueueInboundCalls:
        case VoiceMetric.QueueMissedInboundCalls:
        case VoiceMetric.QueueOutboundCalls:
        case VoiceAgentsMetric.AgentTotalCalls:
        case VoiceAgentsMetric.AgentInboundAnsweredCalls:
        case VoiceAgentsMetric.AgentInboundMissedCalls:
        case VoiceAgentsMetric.AgentOutboundCalls:
        case VoiceAgentsMetric.AgentAverageTalkTime:
            return (metricData: DrillDownMetric) =>
                useDrillDownData(metricData, formatVoiceDrillDownRowData)
        default:
            return (metricData: DrillDownMetric) =>
                useEnrichedDrillDownData(
                    metricData,
                    defaultEnrichmentFields,
                    formatTicketDrillDownRowData,
                    EnrichmentFields.TicketId,
                )
    }
}
