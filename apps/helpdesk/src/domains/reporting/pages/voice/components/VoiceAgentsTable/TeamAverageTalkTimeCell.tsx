import { Skeleton } from '@gorgias/merchant-ui-kit'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import css from 'domains/reporting/pages/voice/components/VoiceAgentsTable/VoiceAgentsTable.less'
import { VOICE_METRIC_COLUMN_WIDTH } from 'domains/reporting/pages/voice/constants/voiceAgents'
import { useAverageTalkTimeMetric } from 'domains/reporting/pages/voice/hooks/agentMetrics'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

const TeamAverageTalkTimeCell = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { data, isFetching } = useAverageTalkTimeMetric(
        cleanStatsFilters,
        userTimezone,
    )
    const metricValue = data?.value

    return (
        <BodyCell justifyContent={'right'} className={css.metricCell}>
            {isFetching ? (
                <Skeleton inline width={VOICE_METRIC_COLUMN_WIDTH} />
            ) : typeof metricValue === 'number' && metricValue < 1 ? (
                '<1s'
            ) : (
                formatMetricValue(
                    metricValue,
                    'duration',
                    NOT_AVAILABLE_PLACEHOLDER,
                )
            )}
        </BodyCell>
    )
}

export default TeamAverageTalkTimeCell
