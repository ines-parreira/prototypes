import { DrillDownModalTrigger } from '@repo/reporting'

import { Box, Heading, ProgressBar, Text } from '@gorgias/axiom'

import type {
    IntentMetric,
    KnowledgeMetric,
} from 'domains/reporting/state/ui/stats/types'

import { useIntentDrillDownTrigger } from '../../hooks/useIntentDrillDownTrigger'
import { useKnowledgeDrillDownTrigger } from '../../hooks/useKnowledgeDrillDownTrigger'

import css from './MetricCells.less'

type BaseMetricCellProps = {
    value: number
    displayValue: string
    dateRange: { start_datetime: string; end_datetime: string }
    outcomeCustomFieldId?: number
    intentCustomFieldId?: number
    showProgressBar?: boolean
    title?: string
    isRow?: boolean
    isBold?: boolean
    isSmall?: boolean
    isHeading?: boolean
}

type KnowledgeMetricCellProps = BaseMetricCellProps & {
    type: 'knowledge'
    metricName: KnowledgeMetric
    resourceSourceId: number
    resourceSourceSetId: number
    shopIntegrationId: number
}

type IntentMetricCellProps = BaseMetricCellProps & {
    type: 'intent'
    metricName: IntentMetric
    intentName?: string
    intentFieldValues?: string[]
    integrationIds: string[]
    outcomeValue?: string
}

type MetricCellProps = KnowledgeMetricCellProps | IntentMetricCellProps

export const MetricCell = (props: MetricCellProps) => {
    const knowledgeData = props.type === 'knowledge' ? props : null
    const intentData = props.type === 'intent' ? props : null

    const {
        openDrillDownModal: openKnowledgeDrillDown,
        tooltipText: knowledgeTooltip,
    } = useKnowledgeDrillDownTrigger({
        metricName:
            knowledgeData?.metricName ??
            ('knowledge_tickets' as KnowledgeMetric),
        resourceSourceId: knowledgeData?.resourceSourceId ?? 0,
        resourceSourceSetId: knowledgeData?.resourceSourceSetId ?? 0,
        shopIntegrationId: knowledgeData?.shopIntegrationId ?? 0,
        dateRange: props.dateRange,
        outcomeCustomFieldId: props.outcomeCustomFieldId,
        intentCustomFieldId: props.intentCustomFieldId,
    })

    const {
        openDrillDownModal: openIntentDrillDown,
        tooltipText: intentTooltip,
    } = useIntentDrillDownTrigger({
        metricName:
            intentData?.metricName ?? ('intent_ticket_volume' as IntentMetric),
        intentName: intentData?.intentName ?? '',
        optionalIntentFieldValues: intentData?.intentFieldValues,
        integrationIds: intentData?.integrationIds ?? [],
        outcomeCustomFieldId: props.outcomeCustomFieldId,
        intentCustomFieldId: props.intentCustomFieldId ?? 0,
        outcomeValue: intentData?.outcomeValue,
        dateRange: props.dateRange,
        title: intentData?.title,
    })

    const openDrillDownModal =
        props.type === 'knowledge'
            ? openKnowledgeDrillDown
            : openIntentDrillDown
    const tooltipText =
        props.type === 'knowledge' ? knowledgeTooltip : intentTooltip

    return (
        <Box
            flexDirection={props?.isRow ? 'row' : 'column'}
            gap={props.isSmall ? 'xxxxs' : 'xxs'}
            className={css.metricCell}
        >
            <DrillDownModalTrigger
                openDrillDownModal={openDrillDownModal}
                tooltipText={tooltipText}
                enabled={props.value > 0}
            >
                {props.isHeading ? (
                    <Heading>{props.displayValue}</Heading>
                ) : (
                    <Text
                        size={props.isSmall ? 'xs' : 'sm'}
                        variant={props.isBold ? 'bold' : 'regular'}
                    >
                        {props.displayValue}
                    </Text>
                )}
            </DrillDownModalTrigger>
            {props.showProgressBar && (
                <Box alignItems="center">
                    <ProgressBar value={props.value} maxValue={100} size="xs" />
                </Box>
            )}
        </Box>
    )
}
