import { DrillDownModalTrigger, TrendBadge } from '@repo/reporting'

import { Box, ProgressBar, Text } from '@gorgias/axiom'

import { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'

import { useKnowledgeDrillDownTrigger } from '../../hooks/useKnowledgeDrillDownTrigger'
import css from './SuccessRateCell.less'
type SuccessRateCellProps = {
    value: number
    prevValue: number | null
    resourceSourceId: number
    resourceSourceSetId: number
    shopIntegrationId: number
    dateRange: { start_datetime: string; end_datetime: string }
    outcomeCustomFieldId?: number
    intentCustomFieldId?: number
}

/**
 * Skills table cell for per-skill success rate. Mirrors the visual pattern
 * `MetricCell` uses (value text + horizontal progress bar) but renders the
 * trend badge inline with the value text, which the table-level Figma calls
 * out. Reuses the same `DrillDownModalTrigger`, `ProgressBar`, and
 * `TrendBadge` primitives `MetricCell` is built from.
 */
export const SuccessRateCell = ({
    value,
    prevValue,
    resourceSourceId,
    resourceSourceSetId,
    shopIntegrationId,
    dateRange,
    outcomeCustomFieldId,
    intentCustomFieldId,
}: SuccessRateCellProps) => {
    const { openDrillDownModal, tooltipText } = useKnowledgeDrillDownTrigger({
        metricName: KnowledgeMetric.SuccessRate,
        resourceSourceId,
        resourceSourceSetId,
        shopIntegrationId,
        dateRange,
        outcomeCustomFieldId,
        intentCustomFieldId,
        title: 'Success rate',
        isSkillScoped: true,
    })

    const percentage = Math.round(value * 100)

    return (
        <Box
            flexDirection="column"
            gap="xxs"
            onClick={(e) => e.stopPropagation()}
        >
            <Box alignItems="center" gap="xxs">
                <DrillDownModalTrigger
                    openDrillDownModal={openDrillDownModal}
                    tooltipText={tooltipText}
                    enabled={percentage > 0}
                >
                    <Text size="sm">{`${percentage}%`}</Text>
                </DrillDownModalTrigger>
                <TrendBadge
                    value={value}
                    prevValue={prevValue}
                    metricFormat="decimal-to-percent"
                    interpretAs="more-is-better"
                    className={css.smallTrendBadge}
                />
            </Box>
            <Box alignItems="center">
                <ProgressBar value={percentage} maxValue={100} size="xs" />
            </Box>
        </Box>
    )
}
