import classNames from 'classnames'
import React, {memo} from 'react'
import {Handle, Position, NodeProps, useNodeId} from 'reactflow'
import {Label} from '@gorgias/ui-kit'

import VisualBuilderActionIconCondensed from 'pages/automate/workflows/components/VisualBuilderActionIconCondensed'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {workflowVariableRegex} from 'pages/automate/workflows/models/variables.model'
import Tooltip from 'pages/common/components/Tooltip'
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
                            {contentText.length > 0 ? (
                                contentText.replace(
                                    workflowVariableRegex,
                                    '{...}'
                                )
                            ) : (
                                <span className={css.clickToAdd}>Message</span>
                            )}
                        </Label>
                    </div>
                    <div className={css.nodeDelimiter} />
                    <div className={css.nodeMetrics}>
                        <div
                            className={css.nodeMetric}
                            id={`node-${nodeId}-metric-view`}
                        >
                            <span className={css.metricLabel}>Views</span>
                            <span className={css.metricValue}>0</span>
                        </div>
                        <div
                            className={css.nodeMetric}
                            id={`node-${nodeId}-metric-dropoff`}
                        >
                            <span className={css.metricLabel}>Drop off</span>
                            <span
                                className={classNames(
                                    css.metricValue,
                                    css.nodeMetricDropOff
                                )}
                            >
                                10%
                            </span>
                        </div>
                    </div>
                    <Tooltip target={`node-${nodeId}-title`} placement="top">
                        {contentText}
                    </Tooltip>

                    <Tooltip
                        target={`node-${nodeId}-metric-view`}
                        placement="bottom"
                    >
                        {/* TODO: display metric when connected to cubeJS */}
                        0%
                    </Tooltip>

                    <Tooltip
                        target={`node-${nodeId}-metric-dropoff`}
                        placement="bottom"
                    >
                        {/* TODO: display metric when connected to cubeJS */}3
                        viewers
                    </Tooltip>
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
