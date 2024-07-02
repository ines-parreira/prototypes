import classNames from 'classnames'
import React, {memo} from 'react'
import {Handle, Position, NodeProps, useNodeId} from 'reactflow'
import {Label} from '@gorgias/ui-kit'

import VisualBuilderActionIconCondensed from 'pages/automate/workflows/components/VisualBuilderActionIconCondensed'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import Tooltip from 'pages/common/components/Tooltip'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {toPercentage} from 'pages/automate/automate-metrics/utils'
import useWorkflowDropoffMetricTiers from 'pages/automate/workflows/hooks/useWorkflowDropoffMetricTiers'
import {getDropoffColor} from 'pages/automate/workflows/utils/getDropOffColor'
import {
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

import {displayMetric, extractUniqueRates, isValidNumber} from '../utils'
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
        'trigger_button' | 'end'
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
    const {workflowStepMetrics} = useWorkflowEditorContext()
    const metricByNodeId = workflowStepMetrics && workflowStepMetrics[nodeId]
    const dropOffRates = extractUniqueRates(workflowStepMetrics ?? {})
    const metricTiers = useWorkflowDropoffMetricTiers({dropOffRates})

    const dropOffTierByNodeId = getDropoffColor(
        metricByNodeId?.dropoffRate ?? 0,
        metricTiers
    )

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
                                {displayMetric(metricByNodeId?.views)}
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
                                {isValidNumber(metricByNodeId?.dropoffRate)
                                    ? toPercentage(
                                          metricByNodeId?.dropoffRate ?? 0
                                      )
                                    : '-'}
                            </span>
                        </div>
                    </div>
                    <Tooltip target={`node-${nodeId}-title`} placement="top">
                        {contentText}
                    </Tooltip>

                    {isValidNumber(metricByNodeId?.viewRate) && (
                        <Tooltip
                            target={`node-${nodeId}-metric-view`}
                            placement="bottom"
                        >
                            {toPercentage(metricByNodeId?.viewRate ?? 0)}
                        </Tooltip>
                    )}
                    {isValidNumber(metricByNodeId?.dropoff) && (
                        <Tooltip
                            target={`node-${nodeId}-metric-dropoff`}
                            placement="bottom"
                        >
                            {metricByNodeId?.dropoff} viewers
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

export default function AnalyticsNodeWrapper(
    node: NodeProps<NodeType['data']>
) {
    const nodeType = node.type as Exclude<
        NonNullable<VisualBuilderNode['type']>,
        'trigger_button' | 'end'
    >

    const {content, name} = node.data as any
    const {text} = content || {}
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
