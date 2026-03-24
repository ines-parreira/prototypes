import { DrillDownModalTrigger } from '@repo/reporting'

import { Box, ProgressBar, Text } from '@gorgias/axiom'

import type { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'

import { useKnowledgeDrillDownTrigger } from '../../hooks/useKnowledgeDrillDownTrigger'

import css from './MetricCells.less'

interface MetricCellProps {
    value: number
    metricName: KnowledgeMetric
    resourceSourceId: number
    resourceSourceSetId: number
    shopIntegrationId: number
    dateRange: { start_datetime: string; end_datetime: string }
    outcomeCustomFieldId?: number
    intentCustomFieldId?: number
    displayValue: string
    showProgressBar?: boolean
}

export const MetricCell = ({
    value,
    metricName,
    resourceSourceId,
    resourceSourceSetId,
    shopIntegrationId,
    dateRange,
    outcomeCustomFieldId,
    intentCustomFieldId,
    displayValue,
    showProgressBar = false,
}: MetricCellProps) => {
    const { openDrillDownModal, tooltipText } = useKnowledgeDrillDownTrigger({
        metricName,
        resourceSourceId,
        resourceSourceSetId,
        shopIntegrationId,
        dateRange,
        outcomeCustomFieldId,
        intentCustomFieldId,
    })

    const content = (
        <Box
            flexDirection="column"
            gap="xxs"
            width="100%"
            className={css.metricCell}
        >
            <DrillDownModalTrigger
                openDrillDownModal={openDrillDownModal}
                tooltipText={tooltipText}
            >
                <Text size="sm">{displayValue}</Text>
            </DrillDownModalTrigger>
            {showProgressBar && (
                <ProgressBar value={value} maxValue={100} size="xs" />
            )}
        </Box>
    )

    return content
}
