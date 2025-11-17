import { useDrillDownData } from 'domains/reporting/hooks/useDrillDownData'
import { formatVoiceDrillDownRowData } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import type { DomainConfig } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import { getDrillDownQuery } from 'domains/reporting/pages/common/drill-down/helpers'
import VoiceCallDrillDownTableContent from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallDrillDownTableContent'
import { VoiceAgentsMetricsConfig } from 'domains/reporting/pages/voice/VoiceConfigs/VoiceAgentMetricsConfig'
import { VoiceMetricsConfig } from 'domains/reporting/pages/voice/VoiceConfigs/VoiceMetricsConfig'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import type {
    VoiceAgentsMetric,
    VoiceMetric,
} from 'domains/reporting/state/ui/stats/types'

export const useVoiceDrillDownHook = (metricData: DrillDownMetric) =>
    useDrillDownData(
        getDrillDownQuery(metricData),
        metricData,
        formatVoiceDrillDownRowData,
    )

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
