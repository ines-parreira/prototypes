import {
    useBreachedSlaVoiceCallsTrend,
    useSlaAchievementRateVoiceCallsTrend,
} from 'domains/reporting/hooks/sla/useSLAsVoiceCallsTrends'
import type { MetricTrendHook } from 'domains/reporting/hooks/useMetricTrend'
import type {
    Domain,
    DrillDownQueryFactory,
} from 'domains/reporting/pages/common/drill-down/types'
import type { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import type { TooltipData } from 'domains/reporting/pages/types'
import { VoiceMetricsConfig } from 'domains/reporting/pages/voice/VoiceConfigs/VoiceMetricsConfig'
import {
    VoiceMetric,
    VoiceSlaMetric,
} from 'domains/reporting/state/ui/stats/types'

export const VoiceSlaMetricConfig: Record<
    VoiceSlaMetric,
    {
        hint: TooltipData
        title: string
        useTrend: MetricTrendHook
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
        metricFormat: MetricTrendFormat
        drillDownMetric?: VoiceMetric
        showMetric: boolean
        domain?: Domain.Voice
        drillDownQuery?: DrillDownQueryFactory
        drillDownTitle?: string
    }
> = {
    [VoiceSlaMetric.VoiceCallsAchievementRate]: {
        hint: {
            title: 'Percentage of calls where your team met the SLA during the selected timeframe',
            link: 'https://link.gorgias.com/jyy',
        },
        title: 'Achievement rate',
        useTrend: useSlaAchievementRateVoiceCallsTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
        drillDownMetric: VoiceMetric.VoiceCallsAchievementRate,
        showMetric: false,
        domain: VoiceMetricsConfig[VoiceMetric.VoiceCallsAchievementRate]
            .domain,
        drillDownQuery:
            VoiceMetricsConfig[VoiceMetric.VoiceCallsAchievementRate]
                .drillDownQuery,
        drillDownTitle:
            VoiceMetricsConfig[VoiceMetric.VoiceCallsAchievementRate].title,
    },
    [VoiceSlaMetric.VoiceCallsBreachedRate]: {
        hint: {
            title: 'Number of calls that breached the SLA policy during the selected timeframe',
            link: 'https://link.gorgias.com/b9p',
        },
        title: 'Calls with breached SLAs',
        useTrend: useBreachedSlaVoiceCallsTrend,
        interpretAs: 'less-is-better',
        metricFormat: 'decimal',
        drillDownMetric: VoiceMetric.VoiceCallsBreachedRate,
        showMetric: false,
        domain: VoiceMetricsConfig[VoiceMetric.VoiceCallsBreachedRate].domain,
        drillDownQuery:
            VoiceMetricsConfig[VoiceMetric.VoiceCallsBreachedRate]
                .drillDownQuery,
        drillDownTitle:
            VoiceMetricsConfig[VoiceMetric.VoiceCallsBreachedRate].title,
    },
}
