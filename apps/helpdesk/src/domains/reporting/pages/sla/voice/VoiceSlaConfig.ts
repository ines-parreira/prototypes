import {
    useBreachedSlaVoiceCallsTrend,
    useSlaAchievementRateVoiceCallsTrend,
} from 'domains/reporting/hooks/sla/useSLAsVoiceCallsTrends'
import type { MetricTrendHook } from 'domains/reporting/hooks/useMetricTrend'
import type { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import type { TooltipData } from 'domains/reporting/pages/types'
import { VoiceSlaMetric } from 'domains/reporting/state/ui/stats/types'

export const SLA_STATUS_COLUMN_LABEL = 'SLA status'

export const SLA_FORMAT = 'sla'

export const VoiceSlaMetricConfig: Record<
    VoiceSlaMetric,
    {
        hint: TooltipData
        title: string
        useTrend: MetricTrendHook
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
        metricFormat: MetricTrendFormat
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
    },
}
