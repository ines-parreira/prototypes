import { Skeleton } from '@gorgias/axiom'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import css from 'domains/reporting/pages/voice/components/VoiceAgentsTable/VoiceAgentsTable.less'
import { VOICE_METRIC_COLUMN_WIDTH } from 'domains/reporting/pages/voice/constants/voiceAgents'
import type { useTotalCallsMetric } from 'domains/reporting/pages/voice/hooks/agentMetrics'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

type TeamAverageCallsCountCellProps = {
    agentsCount: number
    useMetric: typeof useTotalCallsMetric
}
const TeamAverageCallsCountCell = ({
    agentsCount,
    useMetric,
}: TeamAverageCallsCountCellProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { data, isFetching } = useMetric(cleanStatsFilters, userTimezone)
    const metricValue = data?.value ? data.value / agentsCount : data?.value

    return (
        <BodyCell justifyContent={'right'} className={css.metricCell}>
            {isFetching ? (
                <Skeleton inline width={VOICE_METRIC_COLUMN_WIDTH} />
            ) : (
                formatMetricValue(
                    metricValue,
                    'decimal',
                    NOT_AVAILABLE_PLACEHOLDER,
                )
            )}
        </BodyCell>
    )
}

export default TeamAverageCallsCountCell
