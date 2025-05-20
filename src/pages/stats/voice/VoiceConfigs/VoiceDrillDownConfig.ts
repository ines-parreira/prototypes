import { useDrillDownData } from 'hooks/reporting/useDrillDownData'
import { formatVoiceDrillDownRowData } from 'pages/stats/common/drill-down/DrillDownFormatters'
import { DomainConfig } from 'pages/stats/common/drill-down/DrillDownTableConfig'
import VoiceCallDrillDownTableContent from 'pages/stats/voice/components/VoiceCallTable/VoiceCallDrillDownTableContent'
import { DrillDownMetric } from 'state/ui/stats/drillDownSlice'
import { VoiceAgentsMetric, VoiceMetric } from 'state/ui/stats/types'

import { VoiceAgentsMetricsConfig } from './VoiceAgentMetricsConfig'
import { VoiceMetricsConfig } from './VoiceMetricsConfig'

export const useVoiceDrillDownHook = (metricData: DrillDownMetric) =>
    useDrillDownData(metricData, formatVoiceDrillDownRowData)

export const VoiceDrillDownConfig: DomainConfig<
    VoiceMetric | VoiceAgentsMetric
> = {
    drillDownHook: useVoiceDrillDownHook,
    tableComponent: VoiceCallDrillDownTableContent,
    infoBarObjectType: 'voice calls',
    isMetricDataDownloadable: false,
    modalTriggerTooltipText: 'Click to view calls',
    metricsConfig: { ...VoiceMetricsConfig, ...VoiceAgentsMetricsConfig },
}
