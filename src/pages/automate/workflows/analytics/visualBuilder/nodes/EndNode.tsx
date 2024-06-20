import classNames from 'classnames'
import React, {memo} from 'react'
import {Handle, NodeProps, Position, useNodeId} from 'reactflow'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {EndNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {
    endNodeActionIconByAction,
    endNodeActionLabelByAction,
} from 'pages/automate/workflows/constants'

import Tooltip from 'pages/common/components/Tooltip'
import EdgeBlock from '../components/EdgeBlock'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    action: EndNodeType['data']['action']
    nodeId: string
}

const EndNode = memo(function EndNode({action, nodeId, edgeProps}: Props) {
    return (
        <div>
            <EdgeBlock {...edgeProps} />
            <div className={classNames(css.node, css.endNode)}>
                <div className={css.endNodeHeader}>
                    <div>
                        <Badge type={ColorType.Light}>end flow</Badge>
                    </div>
                    <div className={css.endNodeTitle}>
                        <div>
                            <span className={css.iconContainer}>
                                <i className={classNames('material-icons')}>
                                    {endNodeActionIconByAction[action]}
                                </i>
                            </span>
                            {endNodeActionLabelByAction[action]}
                        </div>
                    </div>
                </div>
                <div className={css.nodeDelimiter} />
                <div className={css.nodeMetrics}>
                    <div
                        className={css.nodeMetric}
                        id={`end-node-${nodeId}-metric-automated`}
                    >
                        <span className={css.metricLabel}>Automated</span>
                        <span className={css.metricValue}>0</span>
                    </div>
                    {action !== 'end' && (
                        <div
                            className={css.nodeMetric}
                            id={`end-node-${nodeId}-metric-dropoff`}
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
                    )}
                    <div
                        className={css.nodeMetric}
                        id={`end-node-${nodeId}-metric-ticket`}
                    >
                        <span className={css.metricLabel}>Ticket</span>
                        <span className={css.metricValue}>3</span>
                    </div>
                    <Tooltip
                        target={`end-node-${nodeId}-metric-automated`}
                        placement="bottom"
                    >
                        {/* TODO: display metric when connected to cubeJS */}
                        0%
                        <br />
                        <br />
                        Finished flow and did not <br /> contact Support within
                        72
                    </Tooltip>

                    {action !== 'end' && (
                        <Tooltip
                            target={`end-node-${nodeId}-metric-dropoff`}
                            placement="bottom"
                        >
                            {/* TODO: display metric when connected to cubeJS */}
                            2 viewers
                            <br />
                            <br />
                            Requested Support but left <br /> before a ticket
                            was created
                        </Tooltip>
                    )}

                    <Tooltip
                        target={`end-node-${nodeId}-metric-ticket`}
                        placement="bottom"
                    >
                        {/* TODO: display metric when connected to cubeJS */}
                        50%
                        <br />
                        <br />
                        Helped by an agent <br /> (ticket created)
                    </Tooltip>
                </div>
                <Handle
                    type="target"
                    position={Position.Top}
                    className={classNames(css.sourceHandle)}
                />
            </div>
        </div>
    )
})

export default function EndNodeWrapper(node: NodeProps<EndNodeType['data']>) {
    const commonProps = useVisualBuilderNodeProps(node)
    const nodeId = useNodeId()

    return (
        <EndNode
            {...commonProps}
            action={node.data.action}
            nodeId={nodeId ?? ''}
        />
    )
}
