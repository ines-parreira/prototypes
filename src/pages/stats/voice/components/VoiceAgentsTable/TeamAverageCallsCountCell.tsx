import { Skeleton } from '@gorgias/merchant-ui-kit'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import css from 'pages/stats/voice/components/VoiceAgentsTable/VoiceAgentsTable.less'
import { VOICE_METRIC_COLUMN_WIDTH } from 'pages/stats/voice/constants/voiceAgents'
import { useTotalCallsMetric } from 'pages/stats/voice/hooks/agentMetrics'

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
