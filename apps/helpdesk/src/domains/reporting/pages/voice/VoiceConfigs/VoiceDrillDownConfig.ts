import type { DomainConfig } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import VoiceCallDrillDownTableContent from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallDrillDownTableContent'
import { useVoiceDrillDownHookV2 } from 'domains/reporting/pages/voice/VoiceConfigs/useVoiceDrillDownHookV2'
import { VoiceAgentsMetricsConfig } from 'domains/reporting/pages/voice/VoiceConfigs/VoiceAgentMetricsConfig'
import { VoiceMetricsConfig } from 'domains/reporting/pages/voice/VoiceConfigs/VoiceMetricsConfig'
import type {
    VoiceAgentsMetric,
    VoiceMetric,
} from 'domains/reporting/state/ui/stats/types'

export const VoiceDrillDownConfig: DomainConfig<
    VoiceMetric | VoiceAgentsMetric
> = {
    drillDownHook: useVoiceDrillDownHookV2,
    tableComponent: VoiceCallDrillDownTableContent,
    legacyTableComponent: VoiceCallDrillDownTableContent,
    infoBarObjectType: 'voice calls',
    isMetricDataDownloadable: false,
    modalTriggerTooltipText: 'Click to view calls',
    metricsConfig: { ...VoiceMetricsConfig, ...VoiceAgentsMetricsConfig },
}
