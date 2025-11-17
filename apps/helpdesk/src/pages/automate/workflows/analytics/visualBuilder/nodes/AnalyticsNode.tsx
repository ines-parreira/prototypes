import React, { memo } from 'react'

import type { NodeProps } from '@xyflow/react'
import { Handle, Position, useNodeId } from '@xyflow/react'
import classNames from 'classnames'

import { LegacyLabel as Label, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { toPercentage } from 'pages/automate/automate-metrics/utils'
import VisualBuilderActionIconCondensed from 'pages/automate/workflows/components/VisualBuilderActionIconCondensed'
import type { VisualBuilderNodeProps } from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import { useVisualBuilderNodeProps } from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import useWorkflowDropoffMetricTiers from 'pages/automate/workflows/hooks/useWorkflowDropoffMetricTiers'
import { useWorkflowEditorContext } from 'pages/automate/workflows/hooks/useWorkflowEditor'
import { getDropoffColor } from 'pages/automate/workflows/utils/getDropOffColor'

import type {
    AutomatedMessageNodeType,
    ConditionsNodeType,
    FileUploadNodeType,
    HttpRequestNodeType,
    MultipleChoicesNodeType,
    OrderLineItemSelectionNodeType,
    OrderSelectionNodeType,
    ShopperAuthenticationNodeType,
    TextReplyNodeType,
    VisualBuilderNode,
} from '../../../models/visualBuilderGraph.types'
import EdgeBlock from '../components/EdgeBlock'
import {
    displayMetric,
    displayPercentMetric,
    extractUniqueRates,
    getViewerLabel,
    isValidNumber,
    shouldDisplayTooltip,
} from '../utils'

import css from './Node.less'

type NodeType =
    | AutomatedMessageNodeType
    | MultipleChoicesNodeType
    | ConditionsNodeType
    | FileUploadNodeType
    | HttpRequestNodeType
    | OrderLineItemSelectionNodeType
    | OrderSelectionNodeType
    | ShopperAuthenticationNodeType
    | TextReplyNodeType

type Props = VisualBuilderNodeProps & {
    type: Exclude<
        NonNullable<VisualBuilderNode['type']>,
        | 'channel_trigger'
        | 'llm_prompt_trigger'
        | 'end'
        | 'reusable_llm_prompt_trigger'
        | 'reusable_llm_prompt_call'
    >
    contentText: string
    nodeId: string
}

const AnalyticsNode = memo(function AutomatedMessageNode({
    contentText,
    nodeId,
    type,
    edgeProps,
}: Props) {
    const { workflowStepMetrics } = useWorkflowEditorContext()
    const metricByNodeId = workflowStepMetrics && workflowStepMetrics[nodeId]
    const dropOffRates = extractUniqueRates(workflowStepMetrics ?? {})
    const metricTiers = useWorkflowDropoffMetricTiers({ dropOffRates })

    const dropOffTierByNodeId = getDropoffColor(
        metricByNodeId?.dropoffRate ?? 0,
        metricTiers,
    )

    const shouldDisplayZero = isValidNumber(metricByNodeId?.views)

    return (
        <div>
            <EdgeBlock {...edgeProps} />
            <div className={css.node}>
                <Handle
                    type="target"
                    position={Position.Top}
                    className={css.sourceHandle}
                />
                <div className={css.nodeContainer}>
                    <div className={css.nodeLabel}>
                        <VisualBuilderActionIconCondensed nodeType={type} />
                        <Label
                            className={css.nodeTitle}
                            id={`node-${nodeId}-title`}
                        >
                            {contentText}
                        </Label>
                    </div>
                    <div className={css.nodeDelimiter} />
                    <div className={css.nodeMetrics}>
                        <div
                            className={css.nodeMetric}
                            id={`node-${nodeId}-metric-view`}
                        >
                            <span className={css.metricLabel}>Views</span>
                            <span className={css.metricValue}>
                                {displayMetric(
                                    metricByNodeId?.views,
                                    shouldDisplayZero,
                                )}
                            </span>
                        </div>
                        <div
                            className={css.nodeMetric}
                            id={`node-${nodeId}-metric-dropoff`}
                        >
                            <span className={css.metricLabel}>Drop off</span>
                            <span
                                className={css.metricValue}
                                style={{
                                    color: dropOffTierByNodeId?.color,
                                    backgroundColor:
                                        dropOffTierByNodeId?.background,
                                }}
                            >
                                {displayPercentMetric(
                                    metricByNodeId?.dropoffRate,
                                    shouldDisplayZero,
                                )}
                            </span>
                        </div>
                    </div>

                    <Tooltip target={`node-${nodeId}-title`} placement="top">
                        {contentText}
                    </Tooltip>
                    {shouldDisplayTooltip(
                        metricByNodeId?.viewRate,
                        shouldDisplayZero,
                    ) && (
                        <Tooltip
                            target={`node-${nodeId}-metric-view`}
                            placement="bottom"
                        >
                            {toPercentage(metricByNodeId?.viewRate ?? 0)}
                        </Tooltip>
                    )}
                    {shouldDisplayTooltip(
                        metricByNodeId?.dropoff,
                        shouldDisplayZero,
                    ) && (
                        <Tooltip
                            target={`node-${nodeId}-metric-dropoff`}
                            placement="bottom"
                        >
                            {getViewerLabel(metricByNodeId?.dropoff ?? 0)}
                        </Tooltip>
                    )}
                </div>
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className={classNames(css.targetHandle)}
                />
            </div>
        </div>
    )
})

export default function AnalyticsNodeWrapper(node: NodeProps<NodeType>) {
    const nodeType = node.type as Exclude<
        NonNullable<VisualBuilderNode['type']>,
        | 'channel_trigger'
        | 'llm_prompt_trigger'
        | 'end'
        | 'reusable_llm_prompt_trigger'
        | 'reusable_llm_prompt_call'
    >

    const { content, name } = node.data as any
    const { text } = content || {}
    const nodeLabel =
        text ||
        name ||
        (node.type === 'shopper_authentication'
            ? 'Confirm customer identity'
            : '')

    const commonProps = useVisualBuilderNodeProps(node)
    const nodeId = useNodeId()

    return (
        <AnalyticsNode
            {...commonProps}
            type={nodeType}
            contentText={nodeLabel}
            nodeId={nodeId ?? ''}
        />
    )
}
